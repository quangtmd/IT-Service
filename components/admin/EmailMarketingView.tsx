import React, { useState, useEffect, useCallback } from 'react';
import { EmailCampaign, EmailSubscriber } from '../../types';
import Button from '../ui/Button';
import { 
    getEmailCampaigns, addEmailCampaign, updateEmailCampaign, deleteEmailCampaign,
    getEmailSubscribers, deleteEmailSubscriber
} from '../../services/localDataService';
import BackendConnectionError from '../shared/BackendConnectionError';

type MarketingTab = 'campaigns' | 'subscribers';

const EmailMarketingView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<MarketingTab>('campaigns');
    
    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Email Marketing</h3>
            </div>
            <div className="admin-card-body">
                <nav className="admin-tabs">
                    <button onClick={() => setActiveTab('campaigns')} className={`admin-tab-button ${activeTab === 'campaigns' ? 'active' : ''}`}>Chiến dịch</button>
                    <button onClick={() => setActiveTab('subscribers')} className={`admin-tab-button ${activeTab === 'subscribers' ? 'active' : ''}`}>Người đăng ký</button>
                </nav>
                <div className="mt-6">
                    {activeTab === 'campaigns' && <CampaignsTab />}
                    {activeTab === 'subscribers' && <SubscribersTab />}
                </div>
            </div>
        </div>
    );
};

const CampaignsTab: React.FC = () => {
    const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getEmailCampaigns();
            setCampaigns(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Lỗi tải chiến dịch.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadData() }, [loadData]);
    
    // Placeholder for delete
    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa chiến dịch này?')) {
            await deleteEmailCampaign(id);
            loadData();
        }
    }

    if (isLoading) return <p>Đang tải...</p>;
    if (error) return <BackendConnectionError error={error} />;

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button size="sm" leftIcon={<i className="fas fa-plus"/>}>Tạo Chiến dịch</Button>
            </div>
             <div className="overflow-x-auto">
                <table className="admin-table">
                    <thead className="thead-brand"><tr><th>Tên Chiến dịch</th><th>Tiêu đề Email</th><th>Trạng thái</th><th>Ngày gửi</th><th>Hành động</th></tr></thead>
                    <tbody>
                        {campaigns.map(c => (
                            <tr key={c.id}>
                                <td className="font-semibold">{c.name}</td>
                                <td>{c.subject}</td>
                                <td><span className={`status-badge ${c.status === 'Đã gửi' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{c.status}</span></td>
                                <td>{c.sentAt ? new Date(c.sentAt).toLocaleString('vi-VN') : 'N/A'}</td>
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
    );
};

const SubscribersTab: React.FC = () => {
    const [subscribers, setSubscribers] = useState<EmailSubscriber[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getEmailSubscribers();
            setSubscribers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Lỗi tải danh sách.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadData() }, [loadData]);
    
     const handleDelete = async (id: number) => {
        if (window.confirm('Bạn có chắc muốn xóa email này khỏi danh sách?')) {
            await deleteEmailSubscriber(id);
            loadData();
        }
    }
    
    if (isLoading) return <p>Đang tải...</p>;
    if (error) return <BackendConnectionError error={error} />;

    return (
        <div>
             <div className="overflow-x-auto">
                <table className="admin-table">
                    <thead className="thead-brand"><tr><th>Email</th><th>Tên</th><th>Ngày đăng ký</th><th>Hành động</th></tr></thead>
                    <tbody>
                        {subscribers.map(s => (
                            <tr key={s.id}>
                                <td className="font-semibold">{s.email}</td>
                                <td>{s.name || 'N/A'}</td>
                                <td>{new Date(s.subscribedAt).toLocaleDateString('vi-VN')}</td>
                                <td>
                                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(s.id)}><i className="fas fa-trash"/></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmailMarketingView;
