import React from 'react';
import { HomepageContactSectionSettings } from '../../../types';

interface ContactSectionSettingsFormProps {
    settings: HomepageContactSectionSettings;
    onChange: (newSettings: HomepageContactSectionSettings) => void;
}

const ContactSectionSettingsForm: React.FC<ContactSectionSettingsFormProps> = ({ settings, onChange }) => {
    const handleFieldChange = (field: keyof HomepageContactSectionSettings, value: any) => {
        onChange({ ...settings, [field]: value });
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="admin-form-group">
                    <label>Tiêu đề phụ</label>
                    <input type="text" value={settings.preTitle || ''} onChange={e => handleFieldChange('preTitle', e.target.value)} />
                </div>
                <div className="admin-form-group">
                    <label>Tiêu đề chính</label>
                    <input type="text" value={settings.title} onChange={e => handleFieldChange('title', e.target.value)} />
                </div>
                <div className="admin-form-group-checkbox items-center">
                    <input type="checkbox" checked={settings.enabled} onChange={e => handleFieldChange('enabled', e.target.checked)} id="contact_enabled"/>
                    <label htmlFor="contact_enabled" className="!mb-0 !ml-2">Hiển thị khối này</label>
                </div>
            </div>
        </div>
    );
};

export default ContactSectionSettingsForm;
