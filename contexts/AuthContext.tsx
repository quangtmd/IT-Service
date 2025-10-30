import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, UserRole, AdminNotification, StaffRole } from '../types'; 
import * as Constants from '../constants';
import { getUsers as apiGetUsers } from '../services/localDataService';

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
const CURRENT_USER_SESSION_KEY = 'currentUserSession_v1_api';

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
        await fetchUsers();
        const sessionUser = getSessionStorageItem<User | null>(CURRENT_USER_SESSION_KEY, null);
        if (sessionUser) {
            setCurrentUser(sessionUser);
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (credentials: { email: string; password?: string }): Promise<void> => {
    // This should call a backend login endpoint
    const user = users.find(u => u.email === credentials.email /* && check password */);
    if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        sessionStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(user));
    } else {
        throw new Error('Email hoặc mật khẩu không đúng.');
    }
  };

  const register = async (details: { username: string; email: string; password?: string, role?: UserRole }): Promise<User | null> => {
     // This would call a backend register endpoint
     console.log("Registering user (API call needed):", details);
     // Simulate for now
     const newUser: User = { id: `user-${Date.now()}`, role: 'customer', ...details };
     setUsers(prev => [...prev, newUser]);
     setCurrentUser(newUser);
     setIsAuthenticated(true);
     sessionStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(newUser));
     return newUser;
  };

  const logout = async () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem(CURRENT_USER_SESSION_KEY);
  };
  
  const addUser = async (userDto: Omit<User, 'id'>): Promise<User | null> => {
    // API call to add user
    console.log("Adding user (API call needed):", userDto);
    await fetchUsers(); // refetch
    return null;
  };

  const updateUser = async (userId: string, updates: Partial<User>): Promise<boolean> => {
    // API call to update user
    console.log("Updating user (API call needed):", userId, updates);
    await fetchUsers(); // refetch
    return true;
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
     // API call to delete user
    console.log("Deleting user (API call needed):", userId);
     await fetchUsers(); // refetch
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
    // The role from DB is now simplified string
    // FIX: This comparison appears to be unintentional because the types 'UserRole' and '"Admin"' have no overlap.
    if (currentUser.role === 'admin') return true; 

    if (currentUser.role) { // Assuming any other role from DB is 'staff'
        const currentStaffRoleCleaned = currentUser.staffRole?.trim() as StaffRole;
        
        const allPermissions: AdminPermission[] = [
          'viewDashboard', 'viewNotifications', 'viewContent', 'manageProducts', 'viewProducts', 
          'manageArticles', 'viewArticles', 'manageFaqs', 'viewUsers', 'manageStaff', 'viewCustomers', 
          'viewSales', 'manageOrders', 'viewOrders', 'manageDiscounts', 'viewAppearance', 
          'manageTheme', 'manageMenu', 'manageSiteSettings', 'viewHrm', 'manageEmployees', 
          'managePayroll', 'viewAccounting', 'manageInvoices', 'viewReports', 'viewAnalytics'
        ];
        
        const staffPermissionsMap: Record<StaffRole, AdminPermission[]> = {
            'Quản lý Bán hàng': ['viewDashboard', 'viewSales', 'viewOrders', 'manageOrders', 'manageDiscounts', 'viewNotifications', 'viewProducts', 'viewCustomers', 'viewContent'],
            'Biên tập Nội dung': ['viewDashboard', 'viewContent', 'viewArticles', 'manageArticles', 'manageFaqs', 'viewNotifications', 'manageSiteSettings'],
            'Trưởng nhóm Kỹ thuật': ['viewDashboard', 'viewContent', 'viewProducts', 'manageProducts', 'viewNotifications', 'viewOrders'], 
            'Chuyên viên Hỗ trợ': ['viewDashboard', 'viewSales', 'viewOrders', 'viewNotifications', 'viewCustomers', 'manageFaqs'], 
            'Nhân viên Toàn quyền': allPermissions
        };
        const userStaffPermissions = staffPermissionsMap[currentStaffRoleCleaned] || [];
        return requiredPermissions.every(rp => userStaffPermissions.includes(rp));
    }
    return false; // Customers have no admin permissions
  };


  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, currentUser, login, logout, register, isLoading, users, addUser, updateUser, deleteUser,
      adminNotifications, addAdminNotification, markAdminNotificationRead, clearAdminNotifications, hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};