import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, UserRole, AdminNotification, StaffRole } from '../types'; 
import * as Constants from '../constants';
import { getUsers, addUser as addUserApi, updateUser as updateUserApi, deleteUser as deleteUserApi } from '../services/localDataService';

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
const CURRENT_USER_SESSION_KEY = 'currentUserSession_v1_local';

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

  useEffect(() => {
    const initializeAuth = async () => {
        setIsLoading(true);
        try {
            const fetchedUsers = await getUsers();
            setUsers(fetchedUsers);

            const sessionUser = getSessionStorageItem<User | null>(CURRENT_USER_SESSION_KEY, null);
            if (sessionUser) {
                const updatedUser = fetchedUsers.find(u => u.id === sessionUser.id);
                if (updatedUser) {
                    setCurrentUser(updatedUser);
                    setIsAuthenticated(true);
                } else {
                    // User in session not found in DB, log them out
                    logout();
                }
            }
        } catch (error) {
            console.error("Failed to initialize user data from API:", error);
            // In case of backend error, we can still operate with session user
            const sessionUser = getSessionStorageItem<User | null>(CURRENT_USER_SESSION_KEY, null);
            if (sessionUser) {
                setCurrentUser(sessionUser);
                setIsAuthenticated(true);
            }
        } finally {
            setIsLoading(false);
        }
    };
    initializeAuth();
  }, []);

  const login = async (credentials: { email: string; password?: string }): Promise<void> => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      // Simulate login check against fetched users
      setTimeout(() => {
        const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
        if (user) {
          const { password, ...userToStore } = user;
          setCurrentUser(userToStore as User);
          setIsAuthenticated(true);
          sessionStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(userToStore));
          setIsLoading(false);
          resolve();
        } else {
          setIsLoading(false);
          reject(new Error('Email hoặc mật khẩu không đúng.'));
        }
      }, 500);
    });
  };

  const register = async (details: { username: string; email: string; password?: string, role?: UserRole }): Promise<User | null> => {
      if (users.some(u => u.email === details.email)) {
          throw new Error('Email đã được sử dụng.');
      }
      const newUserDto: Omit<User, 'id'> = {
          username: details.username,
          email: details.email,
          password: details.password,
          role: details.role || 'customer',
          joinDate: new Date().toISOString(),
          status: 'Đang hoạt động',
      };
      const newUser = await addUser(newUserDto);
      if (newUser) {
          addAdminNotification(`Người dùng mới '${newUser.username}' (${newUser.email}) đã đăng ký.`, 'info');
          // Auto-login after registration
          const { password, ...userToStore } = newUser;
          setCurrentUser(userToStore as User);
          setIsAuthenticated(true);
          sessionStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(userToStore));
      }
      return newUser;
  };

  const logout = async () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem(CURRENT_USER_SESSION_KEY);
  };

  const addUser = async (userDto: Omit<User, 'id'>): Promise<User | null> => {
    const newUser = await addUserApi(userDto);
    if (newUser) {
        setUsers(prev => [...prev, newUser]);
        addAdminNotification(`Quản trị viên đã thêm hồ sơ: ${newUser.username}.`, 'success');
    }
    return newUser;
  };

  const updateUser = async (userId: string, updates: Partial<User>): Promise<boolean> => {
    const success = await updateUserApi(userId, updates);
    if (success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
        addAdminNotification(`Thông tin người dùng đã được cập nhật.`, 'info');
    }
    return success;
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
     if (users.find(u => u.id === userId)?.email === Constants.ADMIN_EMAIL) {
        addAdminNotification("Không thể xóa tài khoản quản trị viên chính.", "error");
        return false;
     }
     const success = await deleteUserApi(userId);
     if (success) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        addAdminNotification(`Hồ sơ người dùng đã bị xóa.`, 'warning');
     }
     return success;
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
    if (currentUser.role === 'admin') return true; 

    if (currentUser.role === 'staff' && currentUser.staffRole) {
        const currentStaffRoleCleaned = currentUser.staffRole.trim() as StaffRole;
        
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