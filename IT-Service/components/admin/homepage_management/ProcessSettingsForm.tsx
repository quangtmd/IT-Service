import React, { useState } from 'react';
import { HomepageProcessSettings, HomepageProcessStep } from '../../../types';
import Button from '../../ui/Button';

interface ProcessSettingsFormProps {
    settings: HomepageProcessSettings;
    onChange: (newSettings: HomepageProcessSettings) => void;
}

const ProcessSettingsForm: React.FC<ProcessSettingsFormProps> = ({ settings, onChange }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleFieldChange = (field: keyof Omit<HomepageProcessSettings, 'steps'>, value: any) => {
        onChange({ ...settings, [field]: value });
    };

    const handleStepChange = (id: string, field: keyof HomepageProcessStep, value: any) => {
        const newSteps = settings.steps.map(s => s.id === id ? { ...s, [field]: value } : s);
        onChange({ ...settings, steps: newSteps });
    };

    const handleAdd = () => {
        const order = settings.steps.length > 0 ? Math.max(...settings.steps.map(s => s.order)) + 1 : 1;
        const newItem: HomepageProcessStep = {
            id: `step-${Date.now()}`, stepNumber: `0${order}`, title: 'Bước Mới', description: 'Mô tả cho bước mới.',
            imageUrlSeed: `newStep${order}`, order, alignRight: (order % 2 === 0),
        };
        onChange({ ...settings, steps: [...settings.steps, newItem] });
        setExpandedId(newItem.id);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa bước này?')) {
            onChange({ ...settings, steps: settings.steps.filter(s => s.id !== id) });
        }
    };
    
    const sortedSteps = [...settings.steps].sort((a,b) => a.order - b.order);

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="admin-form-group"><label>Tiêu đề phụ</label><input type="text" value={settings.preTitle || ''} onChange={e => handleFieldChange('preTitle', e.target.value)} /></div>
                <div className="admin-form-group"><label>Tiêu đề chính</label><input type="text" value={settings.title || ''} onChange={e => handleFieldChange('title', e.target.value)} /></div>
                <div className="admin-form-group-checkbox items-center"><input type="checkbox" checked={settings.enabled} onChange={e => handleFieldChange('enabled', e.target.checked)} id="process_enabled"/><label htmlFor="process_enabled" className="!mb-0 !ml-2">Hiển thị khối này</label></div>
            </div>

            <div className="admin-form-subsection-title mt-6">Quản lý các Bước</div>
            <div className="flex justify-end mb-4"><Button onClick={handleAdd} size="sm" leftIcon={<i className="fas fa-plus"></i>}>Thêm Bước</Button></div>
            <div className="space-y-3">
                {sortedSteps.map(step => (
                     <div key={step.id} className="border border-borderDefault rounded-lg bg-gray-50/50">
                        <div className="p-3 flex items-center justify-between bg-white rounded-t-lg border-b">
                            <button onClick={() => setExpandedId(expandedId === step.id ? null : step.id)} className="flex items-center gap-3 flex-grow text-left">
                                <i className={`fas fa-chevron-right transition-transform ${expandedId === step.id ? 'rotate-90' : ''}`}></i>
                                <span className="font-semibold">{step.stepNumber}. {step.title}</span>
                            </button>
                            <Button onClick={() => handleDelete(step.id)} size="sm" variant="ghost" className="!text-red-500 hover:!bg-red-50 !px-2"><i className="fas fa-trash-alt"></i></Button>
                        </div>
                        {expandedId === step.id && (
                             <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="admin-form-group"><label>Số thứ tự (VD: 01)</label><input type="text" value={step.stepNumber} onChange={e => handleStepChange(step.id, 'stepNumber', e.target.value)} /></div>
                                <div className="admin-form-group"><label>Tiêu đề</label><input type="text" value={step.title} onChange={e => handleStepChange(step.id, 'title', e.target.value)} /></div>
                                <div className="admin-form-group md:col-span-2"><label>Mô tả</label><textarea rows={2} value={step.description} onChange={e => handleStepChange(step.id, 'description', e.target.value)}></textarea></div>
                                <div className="admin-form-group"><label>Từ khóa ảnh (Image Seed)</label><input type="text" value={step.imageUrlSeed} onChange={e => handleStepChange(step.id, 'imageUrlSeed', e.target.value)} /></div>
                                <div className="admin-form-group-checkbox items-center pt-6"><input type="checkbox" id={`alignRight-${step.id}`} checked={step.alignRight} onChange={e => handleStepChange(step.id, 'alignRight', e.target.checked)} /><label htmlFor={`alignRight-${step.id}`} className="!mb-0 !ml-2">Căn phải</label></div>
                             </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
export default ProcessSettingsForm;
