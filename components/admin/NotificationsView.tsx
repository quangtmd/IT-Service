import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

const getTypeStyles = (type: 'info' | 'warning' | 'success' | 'error') => {
    switch (type) {
        case 'success': return { icon: 'fa-check-circle', color: 'text-green-500' };
        case 'warning': return { icon: 'fa-exclamation-triangle', color: 'text-yellow-500' };
        case 'error': return { icon: 'fa-times-circle', color: 'text-red-500' };
        default: return { icon: 'fa-info-circle', color: 'text-blue-500' };
    }
};

const NotificationsView: React.FC = () => {
    const { adminNotifications, markAdminNotificationRead, clearAdminNotifications } = useAuth();
    
    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Trung tâm Thông báo</h3>
                {adminNotifications.length > 0 && (
                     <Button onClick={clearAdminNotifications} size="sm" variant="ghost" className="text-red-500">
                        Xóa tất cả
                    </Button>
                )}
            </div>
            <div className="admin-card-body">
                {adminNotifications.length > 0 ? (
                    <div className="space-y-3">
                        {adminNotifications.map(notif => {
                            const styles = getTypeStyles(notif.type);
                            return (
                                <div key={notif.id} className={`flex items-start p-3 rounded-md border ${notif.isRead ? 'bg-gray-50' : 'bg-white shadow-sm'}`}>
                                    <i className={`fas ${styles.icon} ${styles.color} text-xl mt-1 mr-4`}></i>
                                    <div className="flex-grow">
                                        <p className={`text-sm ${notif.isRead ? 'text-textMuted' : 'text-textBase'}`}>{notif.message}</p>
                                        <p className="text-xs text-textSubtle mt-1">{new Date(notif.timestamp).toLocaleString('vi-VN')}</p>
                                    </div>
                                    {!notif.isRead && (
                                        <Button size="sm" variant="ghost" onClick={() => markAdminNotificationRead(notif.id)}>
                                            Đánh dấu đã đọc
                                        </Button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-center text-textMuted py-8">Không có thông báo mới.</p>
                )}
            </div>
        </div>
    );
};

export default NotificationsView;