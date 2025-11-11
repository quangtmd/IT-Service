import React, { useState, useEffect, useCallback } from 'react';
import { AuditLog } from '../../types';
import { getAuditLogs } from '../../services/localDataService';
import BackendConnectionError from '../shared/BackendConnectionError';

const ActivityLogView: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getAuditLogs();
            setLogs(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải nhật ký hoạt động.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Nhật Ký Hoạt Động Hệ Thống</h3>
            </div>
            <div className="admin-card-body">
                {error && <BackendConnectionError error={error} />}
                <div className="overflow-x-auto">
                    <table className="admin-table text-sm">
                        <thead className="thead-brand">
                            <tr>
                                <th>Thời gian</th>
                                <th>Người dùng</th>
                                <th>Hành động</th>
                                <th>Đối tượng</th>
                                <th>Địa chỉ IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={5} className="text-center py-4">Đang tải...</td></tr>
                            ) : !error && logs.length > 0 ? (
                                logs.map(log => (
                                    <tr key={log.id}>
                                        <td className="whitespace-nowrap">{new Date(log.timestamp).toLocaleString('vi-VN')}</td>
                                        <td className="font-semibold">{log.username}</td>
                                        <td><span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">{log.action}</span></td>
                                        <td>{log.targetType} <span className="font-mono text-xs">({log.targetId})</span></td>
                                        <td>{log.ipAddress}</td>
                                    </tr>
                                ))
                            ) : (
                                !error && <tr><td colSpan={5} className="text-center py-4 text-textMuted">Chưa có hoạt động nào được ghi lại.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ActivityLogView;
