

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, UserRole, AdminNotification, StaffRole, STAFF_ROLE_OPTIONS } from '../types'; 
import * as Constants from '../constants.tsx'; // Changed import

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
  login: (credentials: { email: string; password?: string }) => Promise<User | null>;
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

const USERS_STORAGE_KEY = 'registeredUsers_v3'; 
const CURRENT_USER_STORAGE_KEY = 'currentUser_v3';
const ADMIN_NOTIFICATIONS_STORAGE_KEY = 'adminNotifications_v1';


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);

  const getRegisteredUsers = (): User[] => {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    return storedUsers ? JSON.parse(storedUsers) : [];
  };

  const saveRegisteredUsers = (updatedUsers: User[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };
  
  const loadNotifications = () => {
    const storedNotifications = localStorage.getItem(ADMIN_NOTIFICATIONS_STORAGE_KEY);
    setAdminNotifications(storedNotifications ? JSON.parse(storedNotifications) : []);
  };

  const saveNotifications = (notifications: AdminNotification[]) => {
    localStorage.setItem(ADMIN_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications.slice(0, 50)));
    setAdminNotifications(notifications.slice(0,50));
  };


  // Initialize users and pre-register admin if first time
  useEffect(() => {
    let storedUsers = getRegisteredUsers();
    if (storedUsers.length === 0 || !storedUsers.find(u => u.email === Constants.ADMIN_EMAIL && u.role === 'admin')) {
      const adminUser: User = {
        id: 'admin-001',
        username: 'Admin Quang',
        email: Constants.ADMIN_EMAIL, // Use Constants.ADMIN_EMAIL
        password: 'A@a0908225224', 
        role: 'admin',
      };
      storedUsers = storedUsers.filter(u => u.email !== Constants.ADMIN_EMAIL); // Use Constants.ADMIN_EMAIL
      storedUsers.unshift(adminUser); 
      saveRegisteredUsers(storedUsers);
      if (storedUsers.length === 1) { 
          addAdminNotification(`Tài khoản quản trị (${Constants.ADMIN_EMAIL}) đã được tạo tự động.`, 'success'); // Use Constants.ADMIN_EMAIL
      }
    }
    setUsers(storedUsers);
    loadNotifications();

    const storedCurrentUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (storedCurrentUser) {
      try {
        const user = JSON.parse(storedCurrentUser) as User;
        const liveUser = storedUsers.find(u => u.id === user.id);
        if (liveUser) {
            const { password, ...userToStore } = liveUser;
            setCurrentUser(userToStore);
            setIsAuthenticated(true);
        } else {
             localStorage.removeItem(CURRENT_USER_STORAGE_KEY); 
        }
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: { email: string; password?: string }): Promise<User | null> => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const registeredUsers = getRegisteredUsers();
        const foundUser = registeredUsers.find(
          (user) => user.email.toLowerCase() === credentials.email.toLowerCase() &&
                     (user.password === credentials.password || !user.password || !credentials.password) 
        );

        if (foundUser) {
          const { password, ...userToStore } = foundUser; 
          localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(userToStore));
          setCurrentUser(userToStore);
          setIsAuthenticated(true);
          setIsLoading(false);
          resolve(userToStore);
        } else {
          setIsLoading(false);
          resolve(null); 
        }
      }, 500);
    });
  };

  const register = async (details: { username: string; email: string; password?: string, role?: UserRole }): Promise<User | null> => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const registeredUsers = getRegisteredUsers();
        const emailExists = registeredUsers.some(
          (user) => user.email.toLowerCase() === details.email.toLowerCase()
        );

        if (emailExists) {
          setIsLoading(false);
          resolve(null); 
          return;
        }
        
        if (details.email.includes('@') && details.username) {
          const newUser: User = {
            id: `user-${Date.now().toString()}`,
            username: details.username,
            email: details.email,
            password: details.password, 
            role: details.role || 'customer', 
          };
          
          const updatedUsers = [...registeredUsers, newUser];
          saveRegisteredUsers(updatedUsers);
          
          if (newUser.role === 'customer') {
            const { password, ...userToStore } = newUser;
            localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(userToStore));
            setCurrentUser(userToStore);
            setIsAuthenticated(true);
          }
          
          addAdminNotification(`Người dùng mới '${newUser.username}' (${newUser.email}) đã đăng ký với vai trò ${newUser.role}.`, 'info');
          
          setIsLoading(false);
          resolve(newUser); 
        } else {
          setIsLoading(false);
          resolve(null); 
        }
      }, 500);
    });
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const addUser = async (userDto: Omit<User, 'id'>): Promise<User | null> => {
    if (currentUser?.role !== 'admin' && !(currentUser?.role === 'staff' && hasPermission(['manageStaff']))) {
        addAdminNotification("Không có quyền thêm người dùng.", 'error');
        return null;
    }
    const registeredUsers = getRegisteredUsers();
    const emailExists = registeredUsers.some(u => u.email.toLowerCase() === userDto.email.toLowerCase());
    if (emailExists) {
        addAdminNotification(`Email ${userDto.email} đã được sử dụng.`, 'error');
        return null;
    }

    const newUser: User = {
        ...userDto,
        id: `user-${Date.now()}`,
        role: userDto.role || 'staff', 
    };
    
    saveRegisteredUsers([...registeredUsers, newUser]);
    addAdminNotification(`Quản trị viên đã thêm người dùng mới: ${newUser.username} (${newUser.email}) với vai trò ${newUser.staffRole || newUser.role}.`, 'success');
    return newUser;
  };

  const updateUser = async (userId: string, updates: Partial<User>): Promise<boolean> => {
     if (currentUser?.role !== 'admin' && !(currentUser?.role === 'staff' && hasPermission(['manageStaff']))) {
        addAdminNotification("Không có quyền cập nhật người dùng.", 'error');
        return false;
    }
    
    const usersToUpdate = getRegisteredUsers();
    const userIndex = usersToUpdate.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    if (usersToUpdate[userIndex].email === Constants.ADMIN_EMAIL && (updates.role && updates.role !== 'admin' || updates.email && updates.email !== Constants.ADMIN_EMAIL)) { // Use Constants.ADMIN_EMAIL
        addAdminNotification("Không thể thay đổi vai trò hoặc email của quản trị viên chính.", "error");
        return false;
    }
    if (updates.email === Constants.ADMIN_EMAIL && usersToUpdate[userIndex].email !== Constants.ADMIN_EMAIL) { // Use Constants.ADMIN_EMAIL
        addAdminNotification(`Không thể đặt email thành ${Constants.ADMIN_EMAIL} cho người dùng này.`, "error"); // Use Constants.ADMIN_EMAIL
        return false;
    }

    usersToUpdate[userIndex] = { ...usersToUpdate[userIndex], ...updates };
    saveRegisteredUsers(usersToUpdate);
    addAdminNotification(`Thông tin người dùng ${usersToUpdate[userIndex].username} đã được cập nhật.`, 'info');
    
    if (currentUser?.id === userId) {
        const { password, ...userToStore} = usersToUpdate[userIndex];
        setCurrentUser(userToStore);
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(userToStore));
    }
    return true;
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
     if (currentUser?.role !== 'admin' && !(currentUser?.role === 'staff' && hasPermission(['manageStaff']))) {
        addAdminNotification("Không có quyền xóa người dùng.", 'error');
        return false;
     }
     
     const userToDelete = getRegisteredUsers().find(u => u.id === userId);
     if (!userToDelete) return false;

     if (userToDelete.email === Constants.ADMIN_EMAIL && userToDelete.role === 'admin') { // Use Constants.ADMIN_EMAIL
        addAdminNotification("Không thể xóa tài khoản quản trị viên chính.", "error");
        return false;
     }

     saveRegisteredUsers(getRegisteredUsers().filter(u => u.id !== userId));
     addAdminNotification(`Người dùng ${userToDelete.username} (${userToDelete.email}) đã bị xóa.`, 'warning');
     return true;
  };

  const addAdminNotification = (message: string, type: AdminNotification['type'] = 'info') => {
    const newNotification: AdminNotification = {
        id: `notif-${Date.now()}`,
        message,
        type,
        timestamp: new Date().toISOString(),
        isRead: false,
    };
    const updatedNotifications = [newNotification, ...adminNotifications];
    saveNotifications(updatedNotifications);
  };

  const markAdminNotificationRead = (notificationId: string) => {
    const updatedNotifications = adminNotifications.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    saveNotifications(updatedNotifications);
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