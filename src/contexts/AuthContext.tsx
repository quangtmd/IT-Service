
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, UserRole, AdminNotification, StaffRole, AdminPermission } from '../types'; 
import * as Constants from '../constants';
import { getUsers, addUser as apiAddUser, updateUser as apiUpdateUser, deleteUser as apiDeleteUser, loginUser } from '../services/localDataService';

// QUAN TRỌNG: Re-export AdminPermission để các file khác (như AdminPage) có thể import từ đây nếu cần
export type { AdminPermission };

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
const CURRENT_USER_SESSION_KEY = 'currentUserSession_v1';

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
            const usersFromApi = await getUsers();
            setUsers(usersFromApi);
            
            const sessionUser = getSessionStorageItem<User | null>(CURRENT_USER_SESSION_KEY, null);
            if (sessionUser) {
                // Verify session user still exists in the database
                if (usersFromApi.some(u => u.id === sessionUser.id)) {
                    setCurrentUser(sessionUser);
                    setIsAuthenticated(true);
                } else {
                    // Stale session, log out
                    setCurrentUser(null);
                    setIsAuthenticated(false);
                    sessionStorage.removeItem(CURRENT_USER_SESSION_KEY);
                }
            }
        } catch (error) {
            console.error("Failed to initialize user data from API:", error);
            // In case of API failure, can decide to fallback or show error
        } finally {
            setIsLoading(false);
        }
    };
    initializeAuth();
  }, []);

  const login = async (credentials: { email: string; password?: string }): Promise<void> => {
    setIsLoading(true);
    try {
        const user = await loginUser(credentials);
        // The backend has verified the password and returned the user object (without password)
        setCurrentUser(user);
        setIsAuthenticated(true);
        sessionStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(user));
    } catch (error) {
        // The error from fetchFromApi is already user-friendly
        throw error;
    } finally {
        setIsLoading(false);
    }
  };

  const register = async (details: { username: string; email: string; password?: string, role?: UserRole }): Promise<User | null> => {
      // For now, this still uses the local addUser function to simulate registration
      // which now calls the backend.
      const newUser = await addUser({
          ...details,
          role: details.role || 'customer',
          joinDate: new Date().toISOString(),
          status: 'Đang hoạt động',
      });
      if (newUser) {
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
    const newUser = await apiAddUser(userDto);
    if(newUser) {
        setUsers(prev => [...prev, newUser]);
        addAdminNotification(`Quản trị viên đã thêm hồ sơ: ${newUser.username}.`, 'success');
    }
    return newUser;
  };

  const updateUser = async (userId: string, updates: Partial<User>): Promise<boolean> => {
    try {
        await apiUpdateUser(userId, updates);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
        addAdminNotification(`Thông tin người dùng đã được cập nhật.`, 'info');
        return true;
    } catch(e) {
        console.error("Failed to update user:", e);
        return false;
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
     if (users.find(u => u.id === userId)?.email === Constants.ADMIN_EMAIL) {
        addAdminNotification("Không thể xóa tài khoản quản trị viên chính.", "error");
        return false;
     }
     try {
        await apiDeleteUser(userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
        addAdminNotification(`Hồ sơ người dùng đã bị xóa.`, 'warning');
        return true;
     } catch(e) {
        console.error("Failed to delete user:", e);
        return false;
     }
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
          'viewDashboard', 'viewNotifications', 'viewSales', 'viewCustomers', 'manageCustomers', 'viewQuotations', 
          'viewOrders', 'manageOrders', 'manageDiscounts', 'viewSuppliers', 'viewHelpdesk', 
          'viewService', 'manageServiceTickets', 'manageWarranty', 'viewChatLogs', 
          'viewContent', 'viewProducts', 'manageProducts', 'viewArticles', 'manageArticles', 'manageMedia', 'manageFaqs',
          'viewInventory', 'manageInventory', 'viewAccounting', 'manageTransactions', 'managePayroll',
          'viewProcurement', 'viewSystem', 'viewHrm', 'manageEmployees', 'manageSiteSettings', 'manageTheme', 'manageMenu',
          'viewAnalytics', 'viewBranches'
        ];
        
        const staffPermissionsMap: Record<StaffRole, AdminPermission[]> = {
            'Quản lý Bán hàng': ['viewDashboard', 'viewSales', 'viewCustomers', 'manageCustomers', 'viewQuotations', 'viewOrders', 'manageOrders', 'manageDiscounts', 'viewSuppliers', 'viewHelpdesk', 'viewService', 'viewInventory', 'viewNotifications'],
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
