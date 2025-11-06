import React, { useState } from 'react';
import { HomepageTestimonialsSettings, HomepageTestimonialItem } from '../../../types';
import Button from '../../ui/Button';
import ImageUploadInput from '../../ui/ImageUploadInput';

interface TestimonialsSettingsFormProps {
    settings: HomepageTestimonialsSettings;
    onChange: (newSettings: HomepageTestimonialsSettings) => void;
}

const TestimonialsSettingsForm: React.FC<TestimonialsSettingsFormProps> = ({ settings, onChange }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleFieldChange = (field: keyof Omit<HomepageTestimonialsSettings, 'testimonials'>, value: any) => {
        onChange({ ...settings, [field]: value });
    };

    const handleTestimonialChange = (id: string, field: keyof HomepageTestimonialItem, value: any) => {
        const newTestimonials = settings.testimonials.map(t => t.id === id ? { ...t, [field]: value } : t);
        onChange({ ...settings, testimonials: newTestimonials });
    };

    const handleAdd = () => {
        const newItem: HomepageTestimonialItem = {
            id: `testimonial-${Date.now()}`,
            name: 'Tên Khách Hàng',
            quote: 'Nội dung đánh giá...',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
            role: 'Vai trò',
            order: settings.testimonials.length > 0 ? Math.max(...settings.testimonials.map(t => t.order)) + 1 : 1,
        };
        onChange({ ...settings, testimonials: [...settings.testimonials, newItem] });
        setExpandedId(newItem.id);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) {
            onChange({ ...settings, testimonials: settings.testimonials.filter(t => t.id !== id) });
        }
    };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newItems = [...settings.testimonials].sort((a,b) => a.order - b.order);
        const item = newItems[index];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= newItems.length) return;

        newItems[index] = newItems[swapIndex];
        newItems[swapIndex] = item;
        
        const reordered = newItems.map((t, idx) => ({ ...t, order: idx + 1 }));
        onChange({ ...settings, testimonials: reordered });
    };
    
    const sortedTestimonials = [...settings.testimonials].sort((a,b) => a.order - b.order);

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="admin-form-group"><label>Tiêu đề phụ</label><input type="text" value={settings.preTitle || ''} onChange={e => handleFieldChange('preTitle', e.target.value)} /></div>
                <div className="admin-form-group"><label>Tiêu đề chính</label><input type="text" value={settings.title || ''} onChange={e => handleFieldChange('title', e.target.value)} /></div>
                <div className="admin-form-group-checkbox items-center"><input type="checkbox" checked={settings.enabled} onChange={e => handleFieldChange('enabled', e.target.checked)} id="testimonials_enabled"/><label htmlFor="testimonials_enabled" className="!mb-0 !ml-2">Hiển thị khối này</label></div>
            </div>

            <div className="admin-form-subsection-title mt-6">Quản lý Đánh giá</div>
            <div className="flex justify-end mb-4"><Button onClick={handleAdd} size="sm" leftIcon={<i className="fas fa-plus"></i>}>Thêm Đánh giá</Button></div>
            <div className="space-y-3">
                {sortedTestimonials.map((item, index) => (
                    <div key={item.id} className="border border-borderDefault rounded-lg bg-gray-50/50">
                        <div className="p-3 flex items-center justify-between bg-white rounded-t-lg border-b">
                            <button onClick={() => setExpandedId(expandedId === item.id ? null : item.id)} className="flex items-center gap-3 flex-grow text-left">
                                <i className={`fas fa-chevron-right transition-transform ${expandedId === item.id ? 'rotate-90' : ''}`}></i>
                                <span className="font-semibold">{item.name}</span>
                            </button>
                             <div className="flex items-center gap-2">
                                <div className="flex flex-col">
                                    <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="disabled:opacity-20 text-xs p-0.5"><i className="fas fa-angle-up"></i></button>
                                    <button onClick={() => handleMove(index, 'down')} disabled={index === sortedTestimonials.length - 1} className="disabled:opacity-20 text-xs p-0.5"><i className="fas fa-angle-down"></i></button>
                                </div>
                                <Button onClick={() => handleDelete(item.id)} size="sm" variant="ghost" className="!text-red-500 hover:!bg-red-50 !px-2"><i className="fas fa-trash-alt"></i></Button>
                            </div>
                        </div>
                        {expandedId === item.id && (
                             <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="admin-form-group"><label>Tên</label><input type="text" value={item.name} onChange={e => handleTestimonialChange(item.id, 'name', e.target.value)} /></div>
                                <div className="admin-form-group"><label>Vai trò/Chức vụ</label><input type="text" value={item.role || ''} onChange={e => handleTestimonialChange(item.id, 'role', e.target.value)} /></div>
                                <div className="md:col-span-2">
                                  <ImageUploadInput label="URL ảnh đại diện" value={item.avatarUrl} onChange={value => handleTestimonialChange(item.id, 'avatarUrl', value)} />
                                </div>
                                <div className="admin-form-group md:col-span-2"><label>Nội dung đánh giá</label><textarea rows={3} value={item.quote} onChange={e => handleTestimonialChange(item.id, 'quote', e.target.value)}></textarea></div>
                             </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TestimonialsSettingsForm;
