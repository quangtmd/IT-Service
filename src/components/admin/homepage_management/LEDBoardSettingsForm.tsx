
import React, { useState } from 'react';
import { HomepageLEDBoardSettings, LEDBoardItem } from '../../../types';
import Button from '../../ui/Button';
import ImageUploadInput from '../../ui/ImageUploadInput';

interface LEDBoardSettingsFormProps {
    settings: HomepageLEDBoardSettings;
    onChange: (newSettings: HomepageLEDBoardSettings) => void;
}

const LEDBoardSettingsForm: React.FC<LEDBoardSettingsFormProps> = ({ settings, onChange }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleEnabledChange = (value: boolean) => {
        onChange({ ...settings, enabled: value });
    };

    const handleItemChange = (id: string, field: keyof LEDBoardItem, value: any) => {
        const newItems = settings.items.map(item => item.id === id ? { ...item, [field]: value } : item);
        onChange({ ...settings, items: newItems });
    };

    const handleAddItem = () => {
        const newItem: LEDBoardItem = {
            id: `led-${Date.now()}`,
            title: 'TIÊU ĐỀ MỚI',
            content: 'Nội dung quảng cáo...',
            highlight: 'Điểm nhấn',
            isEnabled: true,
            order: settings.items.length > 0 ? Math.max(...settings.items.map(i => i.order)) + 1 : 1,
        };
        onChange({ ...settings, items: [...settings.items, newItem] });
        setExpandedId(newItem.id);
    };

    const handleDeleteItem = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa mục này không?')) {
            onChange({ ...settings, items: settings.items.filter(i => i.id !== id) });
        }
    };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newItems = [...settings.items].sort((a,b) => a.order - b.order);
        const item = newItems[index];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= newItems.length) return;

        newItems[index] = newItems[swapIndex];
        newItems[swapIndex] = item;
        
        const reordered = newItems.map((item, idx) => ({ ...item, order: idx + 1 }));
        onChange({ ...settings, items: reordered });
    };
    
    const sortedItems = [...settings.items].sort((a,b) => a.order - b.order);

    return (
        <div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-blue-800">Trạng thái Bảng LED</h4>
                        <p className="text-sm text-blue-600">Bật/Tắt hiển thị bảng LED trên trang chủ.</p>
                    </div>
                    <div className="admin-form-group-checkbox !mb-0">
                        <input type="checkbox" checked={settings.enabled} onChange={e => handleEnabledChange(e.target.checked)} id="led_enabled" className="w-5 h-5"/>
                        <label htmlFor="led_enabled" className="!mb-0 !ml-2 font-semibold">Hiển thị</label>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h4 className="admin-form-subsection-title !mt-0">Danh sách Slide Quảng cáo</h4>
                <Button onClick={handleAddItem} size="sm" leftIcon={<i className="fas fa-plus"></i>}>Thêm Slide</Button>
            </div>

            <div className="space-y-3">
                {sortedItems.map((item, index) => (
                    <div key={item.id} className={`border rounded-lg transition-colors ${item.isEnabled ? 'bg-white border-borderDefault' : 'bg-gray-100 border-gray-300 opacity-75'}`}>
                        <div className="p-3 flex items-center justify-between border-b rounded-t-lg bg-gray-50">
                            <button onClick={() => setExpandedId(expandedId === item.id ? null : item.id)} className="flex items-center gap-3 flex-grow text-left">
                                <i className={`fas fa-chevron-right transition-transform ${expandedId === item.id ? 'rotate-90' : ''}`}></i>
                                <span className="font-semibold text-sm">{item.title}</span>
                                {item.imageUrl && <i className="fas fa-image text-gray-400 text-xs" title="Có hình ảnh"></i>}
                            </button>
                            <div className="flex items-center gap-2">
                                <label className="flex items-center text-xs text-textMuted cursor-pointer mr-2">
                                    <input type="checkbox" checked={item.isEnabled} onChange={e => handleItemChange(item.id, 'isEnabled', e.target.checked)} className="mr-1.5"/>
                                    Bật
                                </label>
                                <div className="flex flex-col mr-2">
                                    <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="disabled:opacity-20 text-xs p-0.5 text-gray-500 hover:text-primary"><i className="fas fa-angle-up"></i></button>
                                    <button onClick={() => handleMove(index, 'down')} disabled={index === sortedItems.length - 1} className="disabled:opacity-20 text-xs p-0.5 text-gray-500 hover:text-primary"><i className="fas fa-angle-down"></i></button>
                                </div>
                                <Button onClick={() => handleDeleteItem(item.id)} size="sm" variant="ghost" className="!text-red-500 hover:!bg-red-50 !px-2"><i className="fas fa-trash-alt"></i></Button>
                            </div>
                        </div>
                        
                        {expandedId === item.id && (
                             <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-b-lg">
                                <div className="admin-form-group">
                                    <label>Tiêu đề (Dòng 1 - Vàng)</label>
                                    <input type="text" value={item.title} onChange={e => handleItemChange(item.id, 'title', e.target.value)} placeholder="VD: KHUYẾN MÃI HOT" />
                                </div>
                                <div className="admin-form-group">
                                    <label>Điểm nhấn (Nút/Nhãn - Nhấp nháy)</label>
                                    <input type="text" value={item.highlight} onChange={e => handleItemChange(item.id, 'highlight', e.target.value)} placeholder="VD: Ưu đãi có hạn" />
                                </div>
                                <div className="admin-form-group md:col-span-2">
                                    <label>Nội dung (Dòng 2 - Xanh cyan)</label>
                                    <textarea rows={2} value={item.content} onChange={e => handleItemChange(item.id, 'content', e.target.value)} placeholder="Mô tả ngắn gọn..."></textarea>
                                </div>
                                <div className="md:col-span-2">
                                    <ImageUploadInput 
                                        label="Hình ảnh minh họa (Tùy chọn)" 
                                        value={item.imageUrl || ''} 
                                        onChange={value => handleItemChange(item.id, 'imageUrl', value)} 
                                        showPreview={true}
                                    />
                                    <p className="form-input-description">Nên dùng ảnh tỉ lệ vuông hoặc 4:3, nền trong suốt hoặc tối màu để đẹp nhất trên bảng LED.</p>
                                </div>
                             </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LEDBoardSettingsForm;