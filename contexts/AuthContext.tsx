import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, UserRole, AdminNotification, StaffRole } from '../types'; 
import * as Constants from '../constants';
import { getUsers as apiGetUsers, loginUser as apiLoginUser } from '../services/localDataService';

export type AdminPermission = 
  // General
  | 'viewDashboard'
  | 'viewNotifications'
  // Website Content Management
  | 'viewContent'
  | 'manageProducts'
  | 'viewProducts'
  | 'manageArticles'
  | 'viewArticles'
  | 'manageFaqs'
  // User Management
  | 'viewUsers'
  | 'manageStaff'
  | 'viewCustomers'
  // Sales Management
  | 'viewSales'
  | 'manageOrders'
  | 'viewOrders'
  | 'manageDiscounts'
  // Appearance & Settings
  | 'viewAppearance'
  | 'manageTheme'
  | 'manageMenu'
  | 'manageSiteSettings'
  // HRM (Future)
  | 'viewHrm'
  | 'manageEmployees'
  | 'managePayroll'
  // Accounting (Future)
  | 'viewAccounting'
  | 'manageInvoices'
  | 'viewReports'
  // High-level (Future)
  | 'viewAnalytics';

export interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (credentials: { email: string; password?: string }) => Promise<void>;
  logout: () => void;
  register: (details: { username: string; email: string; password?: string, role?: UserRole }) => Promise<User | null>;
  isLoading: boolean;
  users: User[]; 
  addUser: (user: Omit<User, 'id'>) => Promise<User | null>; 
  updateUser: (userId: string, updates: Partial<User>) => Promise<boolean>; 
  deleteUser: (userId: string) => Promise<boolean>; 
  adminNotifications: AdminNotification[];
  addAdminNotification: (message: string, type?: AdminNotification['type']) => void; 
  markAdminNotificationRead: (notificationId: string) => void;
  clearAdminNotifications: () => void;
  hasPermission: (requiredPermissions: Array<AdminPermission>) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_NOTIFICATIONS_STORAGE_KEY = 'adminNotifications_v1';
const CURRENT_USER_SESSION_KEY = 'currentUserSession_v2_api';

const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        return defaultValue;
    }
};

const getSessionStorageItem = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        return defaultValue;
    }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getSessionStorageItem(CURRENT_USER_SESSION_KEY, null));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!currentUser);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>(() => getLocalStorageItem(ADMIN_NOTIFICATIONS_STORAGE_KEY, []));

  const fetchUsers = async () => {
      try {
          const apiUsers = await apiGetUsers();
          setUsers(apiUsers);
      } catch (error) {
          console.error("Failed to fetch users:", error);
      }
  };

  useEffect(() => {
    const initializeAuth = async () => {
        setIsLoading(true);
        const sessionUser = getSessionStorageItem<User | null>(CURRENT_USER_SESSION_KEY, null);
        if (sessionUser) {
            setCurrentUser(sessionUser);
            setIsAuthenticated(true);
            // Don't fetch all users on load unless necessary
            if (sessionUser.role === 'admin' || sessionUser.role === 'staff') {
                await fetchUsers();
            }
        }
        setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (credentials: { email: string; password?: string }): Promise<void> => {
    try {
        const user = await apiLoginUser(credentials);
        if (user) {
            setCurrentUser(user as User);
            setIsAuthenticated(true);
            sessionStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(user));
            if (user.role === 'admin' || user.role === 'staff') {
                await fetchUsers(); 
            }
        } else {
            throw new Error('Không nhận được thông tin người dùng từ server.');
        }
    } catch (error) {
        throw error;
    }
  };

  const register = async (details: { username: string; email: string; password?: string, role?: UserRole }): Promise<User | null> => {
     console.log("Registering user (API call needed):", details);
     alert("Chức năng đăng ký đang được phát triển.");
     return null;
  };

  const logout = async () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem(CURRENT_USER_SESSION_KEY);
  };
  
  const addUser = async (userDto: Omit<User, 'id'>): Promise<User | null> => {
    console.log("Adding user (API call needed):", userDto);
    await fetchUsers();
    return null;
  };

  const updateUser = async (userId: string, updates: Partial<User>): Promise<boolean> => {
    console.log("Updating user (API call needed):", userId, updates);
    await fetchUsers();
    return true;
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    console.log("Deleting user (API call needed):", userId);
     await fetchUsers();
     return true;
  };
  
  const saveNotifications = (notifications: AdminNotification[]) => {
    const limitedNotifications = notifications.slice(0, 50);
    localStorage.setItem(ADMIN_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(limitedNotifications));
    setAdminNotifications(limitedNotifications);
  };
  
  const addAdminNotification = (message: string, type: AdminNotification['type'] = 'info') => {
    const newNotification: AdminNotification = {
        id: `notif-${Date.now()}`, message, type,
        timestamp: new Date().toISOString(), isRead: false,
    };
    saveNotifications([newNotification, ...adminNotifications]);
  };

  const markAdminNotificationRead = (notificationId: string) => {
    const updated = adminNotifications.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
    saveNotifications(updated);
  };

  const clearAdminNotifications = () => {
    saveNotifications([]);
  };

   const hasPermission = (requiredPermissions: Array<AdminPermission>): boolean => {
    if (!isAuthenticated || !currentUser) return false;
    
    // Admins have all permissions implicitly
    if (currentUser.role === 'admin') return true; 

    // For staff, check against the permissions array fetched during login
    if (currentUser.role === 'staff') {
        // The currentUser object from the backend should now contain a 'permissions' array
        const userPermissions = (currentUser as any).permissions || [];
        if (requiredPermissions.length === 0) return true;
        return requiredPermissions.every(rp => userPermissions.includes(rp));
    }

    return false; // Customers have no admin permissions
  };

  const value: AuthContextType = {
    isAuthenticated,
    currentUser,
    login,
    logout,
    register,
    isLoading,
    users,
    addUser,
    updateUser,
    deleteUser,
    adminNotifications,
    addAdminNotification,
    markAdminNotificationRead,
    clearAdminNotifications,
    hasPermission
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
