import React, { useState, useEffect, useCallback } from 'react';
import { AdCampaign } from '../../types';
import Button from '../ui/Button';
import { 
    getAdCampaigns, addAdCampaign, updateAdCampaign, deleteAdCampaign
} from '../../services/localDataService';
import BackendConnectionError from '../shared/BackendConnectionError';

const SeoManagementView: React.FC = () => {
    const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAdCampaigns();
            setCampaigns(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Lỗi tải chiến dịch quảng cáo.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadData() }, [loadData]);

    // Placeholder for delete
    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa chiến dịch này?')) {
            await deleteAdCampaign(id);
            loadData();
        }
    }

    if (isLoading) return <p>Đang tải...</p>;
    if (error) return <BackendConnectionError error={error} />;

    return (
         <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Quản lý Quảng cáo & SEO</h3>
                 <div className="admin-actions-bar">
                    <Button size="sm" leftIcon={<i className="fas fa-plus"/>}>Thêm Chiến dịch</Button>
                </div>
            </div>
            <div className="admin-card-body">
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead className="thead-brand">
                            <tr>
                                <th>Tên Chiến dịch</th>
                                <th>Nguồn</th>
                                <th className="text-right">Chi phí</th>
                                <th className="text-right">Clicks</th>
                                <th className="text-right">Chuyển đổi</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map(c => (
                                <tr key={c.id}>
                                    <td className="font-semibold">{c.name}</td>
                                    <td>{c.source}</td>
                                    <td className="text-right">{c.cost.toLocaleString('vi-VN')}₫</td>
                                    <td className="text-right">{c.clicks}</td>
                                    <td className="text-right">{c.conversions}</td>
                                    <td>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline"><i className="fas fa-edit"/></Button>
                                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(c.id)}><i className="fas fa-trash"/></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SeoManagementView;
