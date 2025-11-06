import React, { useState } from 'react';
import { HomepageStatsCounterSettings, HomepageStatItem } from '../../../types';
import Button from '../../ui/Button';

interface StatsCounterSettingsFormProps {
    settings: HomepageStatsCounterSettings;
    onChange: (newSettings: HomepageStatsCounterSettings) => void;
}

const StatsCounterSettingsForm: React.FC<StatsCounterSettingsFormProps> = ({ settings, onChange }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleEnabledChange = (value: boolean) => {
        onChange({ ...settings, enabled: value });
    };

    const handleStatChange = (id: string, field: keyof HomepageStatItem, value: any) => {
        const newStats = settings.stats.map(s => s.id === id ? { ...s, [field]: value } : s);
        onChange({ ...settings, stats: newStats });
    };

    const handleAddStat = () => {
        const newStat: HomepageStatItem = {
            id: `stat-${Date.now()}`,
            iconClass: 'fas fa-star',
            count: '100+',
            label: 'Mục Mới',
            order: settings.stats.length > 0 ? Math.max(...settings.stats.map(s => s.order)) + 1 : 1,
        };
        onChange({ ...settings, stats: [...settings.stats, newStat] });
        setExpandedId(newStat.id);
    };

    const handleDeleteStat = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa mục thống kê này không?')) {
            onChange({ ...settings, stats: settings.stats.filter(s => s.id !== id) });
        }
    };
    
    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newStats = [...settings.stats].sort((a,b) => a.order - b.order);
        const item = newStats[index];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= newStats.length) return;

        newStats[index] = newStats[swapIndex];
        newStats[swapIndex] = item;
        
        const reordered = newStats.map((s, idx) => ({ ...s, order: idx + 1 }));
        onChange({ ...settings, stats: reordered });
    };
    
    const sortedStats = [...settings.stats].sort((a,b) => a.order - b.order);

    return (
        <div>
            <div className="admin-form-group-checkbox items-center mb-6">
                <input type="checkbox" checked={settings.enabled} onChange={e => handleEnabledChange(e.target.checked)} id="stats_enabled"/>
                <label htmlFor="stats_enabled" className="!mb-0 !ml-2">Hiển thị khối Thống kê</label>
            </div>

            <div className="flex justify-end mb-4"><Button onClick={handleAddStat} size="sm" leftIcon={<i className="fas fa-plus"></i>}>Thêm Mục</Button></div>
            <div className="space-y-3">
                {sortedStats.map((stat, index) => (
                    <div key={stat.id} className="border border-borderDefault rounded-lg bg-gray-50/50">
                        <div className="p-3 flex items-center justify-between bg-white rounded-t-lg border-b">
                            <button onClick={() => setExpandedId(expandedId === stat.id ? null : stat.id)} className="flex items-center gap-3 flex-grow text-left">
                                <i className={`fas fa-chevron-right transition-transform ${expandedId === stat.id ? 'rotate-90' : ''}`}></i>
                                <span className="font-semibold">{stat.label} ({stat.count})</span>
                            </button>
                             <div className="flex items-center gap-2">
                                <div className="flex flex-col">
                                    <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="disabled:opacity-20 text-xs p-0.5"><i className="fas fa-angle-up"></i></button>
                                    <button onClick={() => handleMove(index, 'down')} disabled={index === sortedStats.length - 1} className="disabled:opacity-20 text-xs p-0.5"><i className="fas fa-angle-down"></i></button>
                                </div>
                                <Button onClick={() => handleDeleteStat(stat.id)} size="sm" variant="ghost" className="!text-red-500 hover:!bg-red-50 !px-2"><i className="fas fa-trash-alt"></i></Button>
                            </div>
                        </div>
                        {expandedId === stat.id && (
                             <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="admin-form-group"><label>Icon (lớp FontAwesome)</label><input type="text" value={stat.iconClass} onChange={e => handleStatChange(stat.id, 'iconClass', e.target.value)} /></div>
                                <div className="admin-form-group"><label>Số lượng (VD: 100+)</label><input type="text" value={stat.count} onChange={e => handleStatChange(stat.id, 'count', e.target.value)} /></div>
                                <div className="admin-form-group"><label>Nhãn</label><input type="text" value={stat.label} onChange={e => handleStatChange(stat.id, 'label', e.target.value)} /></div>
                             </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatsCounterSettingsForm;
