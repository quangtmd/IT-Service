import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, UserRole, AdminNotification, StaffRole } from '../types'; 
import * as Constants from '../constants';
import { MOCK_STAFF_USERS } from '../data/mockData';

export type AdminPermission = 
  // General
  | 'viewDashboard' | 'viewNotifications'
  // Sales & CRM
  | 'viewSales' | 'viewCustomers' | 'viewQuotations' | 'viewOrders' | 'manageOrders' | 'manageDiscounts' | 'viewSuppliers' | 'viewHelpdesk'
  // Service
  | 'viewService' | 'manageServiceTickets' | 'manageWarranty' | 'viewChatLogs'
  // Content
  | 'viewContent' | 'viewProducts' | 'manageProducts' | 'viewArticles' | 'manageArticles' | 'manageMedia' | 'manageFaqs'
  // Inventory
  | 'viewInventory' | 'manageInventory'
  // Finance
  | 'viewAccounting' | 'manageTransactions' | 'managePayroll'
  // Procurement
  | 'viewProcurement'
  // HR & System
  | 'viewSystem' | 'viewHrm' | 'manageEmployees' | 'manageSiteSettings' | 'manageTheme' | 'manageMenu'
  // Analytics
  | 'viewAnalytics'
  // Multi-branch
  | 'viewBranches'
  ;


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
const USERS_STORAGE_KEY = 'siteUsers_v1_local';
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
  const [users, setUsers] = useState<User[]>(() => getLocalStorageItem(USERS_STORAGE_KEY, []));
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>(() => getLocalStorageItem(ADMIN_NOTIFICATIONS_STORAGE_KEY, []));

  useEffect(() => {
    const initializeUsers = () => {
        const storedUsers = getLocalStorageItem<User[]>(USERS_STORAGE_KEY, []);
        if (storedUsers.length === 0) {
            const adminUser: User = {
                id: 'admin001',
                username: 'Admin Quang',
                email: Constants.ADMIN_EMAIL,
                password: 'password123', // In a real app, this should be hashed.
                role: 'admin',
                staffRole: 'Nhân viên Toàn quyền',
            };
            const initialUsers = [adminUser, ...MOCK_STAFF_USERS];
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
            setUsers(initialUsers);
        } else {
            setUsers(storedUsers);
        }
        
        const sessionUser = getSessionStorageItem<User | null>(CURRENT_USER_SESSION_KEY, null);
        if (sessionUser) {
            setCurrentUser(sessionUser);
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    };
    initializeUsers();
  }, []);

  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  }

  const login = async (credentials: { email: string; password?: string }): Promise<void> => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => { // Simulate network delay
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
    setIsLoading(true);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (users.some(u => u.email === details.email)) {
                setIsLoading(false);
                reject(new Error('Email đã được sử dụng.'));
                return null;
            }

            const newUser: User = {
                id: `user-${Date.now()}`,
                username: details.username,
                email: details.email,
                password: details.password,
                role: details.role || 'customer',
                joinDate: new Date().toISOString(),
                status: 'Đang hoạt động',
            };
            
            const updatedUsers = [...users, newUser];
            saveUsers(updatedUsers);

            addAdminNotification(`Người dùng mới '${newUser.username}' (${newUser.email}) đã đăng ký.`, 'info');
            
            // Auto-login after registration
            const { password, ...userToStore } = newUser;
            setCurrentUser(userToStore as User);
            setIsAuthenticated(true);
            sessionStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(userToStore));
            
            setIsLoading(false);
            resolve(newUser);
        }, 500);
    });
  };

  const logout = async () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem(CURRENT_USER_SESSION_KEY);
  };

  const addUser = async (userDto: Omit<User, 'id'>): Promise<User | null> => {
    const newUser = { ...userDto, id: `user-${Date.now()}`};
    saveUsers([...users, newUser]);
    addAdminNotification(`Quản trị viên đã thêm hồ sơ: ${newUser.username}.`, 'success');
    return newUser;
  };

  const updateUser = async (userId: string, updates: Partial<User>): Promise<boolean> => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, ...updates } : u);
    saveUsers(updatedUsers);
    addAdminNotification(`Thông tin người dùng đã được cập nhật.`, 'info');
    return true;
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
     if (users.find(u => u.id === userId)?.email === Constants.ADMIN_EMAIL) {
        addAdminNotification("Không thể xóa tài khoản quản trị viên chính.", "error");
        return false;
     }
     saveUsers(users.filter(u => u.id !== userId));
     addAdminNotification(`Hồ sơ người dùng đã bị xóa.`, 'warning');
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
    if (currentUser.role === 'admin') return true; 

    if (currentUser.role === 'staff' && currentUser.staffRole) {
        const currentStaffRoleCleaned = currentUser.staffRole.trim() as StaffRole;
        
        const allPermissions: AdminPermission[] = [
          'viewDashboard', 'viewNotifications', 'viewSales', 'viewCustomers', 'viewQuotations', 
          'viewOrders', 'manageOrders', 'manageDiscounts', 'viewSuppliers', 'viewHelpdesk', 
          'viewService', 'manageServiceTickets', 'manageWarranty', 'viewChatLogs', 
          'viewContent', 'viewProducts', 'manageProducts', 'viewArticles', 'manageArticles', 'manageMedia', 'manageFaqs',
          'viewInventory', 'manageInventory', 'viewAccounting', 'manageTransactions', 'managePayroll',
          'viewProcurement', 'viewSystem', 'viewHrm', 'manageEmployees', 'manageSiteSettings', 'manageTheme', 'manageMenu',
          'viewAnalytics', 'viewBranches'
        ];
        
        const staffPermissionsMap: Record<StaffRole, AdminPermission[]> = {
            'Quản lý Bán hàng': ['viewDashboard', 'viewSales', 'viewCustomers', 'viewQuotations', 'viewOrders', 'manageOrders', 'manageDiscounts', 'viewSuppliers', 'viewHelpdesk', 'viewService', 'viewInventory', 'viewNotifications'],
            'Biên tập Nội dung': ['viewDashboard', 'viewContent', 'viewArticles', 'manageArticles', 'manageFaqs', 'manageMedia', 'manageSiteSettings', 'viewNotifications'],
            'Trưởng nhóm Kỹ thuật': ['viewDashboard', 'viewService', 'manageServiceTickets', 'manageWarranty', 'viewInventory', 'manageInventory', 'viewOrders', 'viewProducts', 'viewNotifications'], 
            'Chuyên viên Hỗ trợ': ['viewDashboard', 'viewHelpdesk', 'manageServiceTickets', 'viewOrders', 'viewCustomers', 'viewChatLogs', 'viewNotifications'], 
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