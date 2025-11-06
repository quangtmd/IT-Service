import React from 'react';
import { HomepageBlogPreviewSettings } from '../../../types';

interface BlogPreviewSettingsFormProps {
    settings: HomepageBlogPreviewSettings;
    onChange: (newSettings: HomepageBlogPreviewSettings) => void;
}

const BlogPreviewSettingsForm: React.FC<BlogPreviewSettingsFormProps> = ({ settings, onChange }) => {
    const handleFieldChange = (field: keyof HomepageBlogPreviewSettings, value: any) => {
        onChange({ ...settings, [field]: value });
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="admin-form-group"><label>Tiêu đề phụ</label><input type="text" value={settings.preTitle || ''} onChange={e => handleFieldChange('preTitle', e.target.value)} /></div>
                <div className="admin-form-group"><label>Tiêu đề chính</label><input type="text" value={settings.title} onChange={e => handleFieldChange('title', e.target.value)} /></div>
                <div className="admin-form-group md:col-span-2">
                    <label>ID Bài viết nổi bật (chính)</label>
                    <input type="text" value={settings.featuredArticleId || ''} onChange={e => handleFieldChange('featuredArticleId', e.target.value)} />
                    <p className="form-input-description">Để trống nếu không muốn có bài viết nổi bật.</p>
                </div>
                <div className="admin-form-group md:col-span-2">
                    <label>IDs Bài viết khác (phân cách bằng dấu phẩy)</label>
                    <input type="text" value={(settings.otherArticleIds || []).join(', ')} onChange={e => handleFieldChange('otherArticleIds', e.target.value.split(',').map(id => id.trim()))} />
                    <p className="form-input-description">Ví dụ: it001, it002, it003</p>
                </div>
                <div className="admin-form-group-checkbox items-center">
                    <input type="checkbox" checked={settings.enabled} onChange={e => handleFieldChange('enabled', e.target.checked)} id="blog_enabled"/>
                    <label htmlFor="blog_enabled" className="!mb-0 !ml-2">Hiển thị khối này</label>
                </div>
            </div>
        </div>
    );
};

export default BlogPreviewSettingsForm;
