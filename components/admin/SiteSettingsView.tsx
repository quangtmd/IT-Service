
import React, { useState, useEffect } from 'react';
import { SiteSettings, SiteThemeSettings, CustomMenuLink } from '../../types';
import * as Constants from '../../constants';
import Button from '../ui/Button';

type SettingsTab = 'site_settings' | 'theme_settings' | 'menu_settings';

const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
    try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : defaultValue; } 
    catch (e) { console.error(e); return defaultValue; }
};

const setLocalStorageItem = <T,>(key: string, value: T) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } 
    catch (e) { console.error(e); }
};

const SiteSettingsView: React.FC<{ initialTab?: SettingsTab }> = ({ initialTab = 'site_settings' }) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => getLocalStorageItem(Constants.SITE_CONFIG_STORAGE_KEY, Constants.INITIAL_SITE_SETTINGS));
    const [themeSettings, setThemeSettings] = useState<SiteThemeSettings>(() => getLocalStorageItem(Constants.THEME_SETTINGS_STORAGE_KEY, Constants.INITIAL_THEME_SETTINGS));
    const [menuLinks, setMenuLinks] = useState<CustomMenuLink[]>(() => getLocalStorageItem(Constants.CUSTOM_MENU_STORAGE_KEY, Constants.INITIAL_CUSTOM_MENU_LINKS));
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    const handleSave = () => {
        setSaveStatus('saving');
        try {
            if (activeTab === 'site_settings') {
                setLocalStorageItem(Constants.SITE_CONFIG_STORAGE_KEY, siteSettings);
                window.dispatchEvent(new CustomEvent('siteSettingsUpdated'));
            } else if (activeTab === 'theme_settings') {
                setLocalStorageItem(Constants.THEME_SETTINGS_STORAGE_KEY, themeSettings);
                window.dispatchEvent(new CustomEvent('siteSettingsUpdated')); // Also triggers theme reload script
            } else if (activeTab === 'menu_settings') {
                setLocalStorageItem(Constants.CUSTOM_MENU_STORAGE_KEY, menuLinks);
                window.dispatchEvent(new CustomEvent('menuUpdated'));
            }
            setSaveStatus('success');
        } catch (error) {
            setSaveStatus('error');
        } finally {
            setTimeout(() => setSaveStatus('idle'), 2000);
        }
    };
    
    const renderSaveButton = () => {
        switch(saveStatus) {
            case 'saving': return <Button isLoading>Đang lưu...</Button>
            case 'success': return <Button className="bg-green-500 hover:bg-green-600"><i className="fas fa-check mr-2"></i>Đã lưu!</Button>
            case 'error': return <Button className="bg-red-500 hover:bg-red-600">Lỗi!</Button>
            default: return <Button onClick={handleSave}>Lưu thay đổi</Button>
        }
    }

    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Cài đặt & Cấu hình</h3>
                {renderSaveButton()}
            </div>
            <div className="admin-card-body">
                <nav className="admin-tabs">
                    <button onClick={() => setActiveTab('site_settings')} className={`admin-tab-button ${activeTab === 'site_settings' ? 'active' : ''}`}>Thông tin chung</button>
                    <button onClick={() => setActiveTab('theme_settings')} className={`admin-tab-button ${activeTab === 'theme_settings' ? 'active' : ''}`}>Theme & Màu sắc</button>
                    <button onClick={() => setActiveTab('menu_settings')} className={`admin-tab-button ${activeTab === 'menu_settings' ? 'active' : ''}`}>Menu điều hướng</button>
                </nav>
                <div>
                    {activeTab === 'site_settings' && <SiteInfoForm settings={siteSettings} setSettings={setSiteSettings} />}
                    {activeTab === 'theme_settings' && <ThemeSettingsForm settings={themeSettings} setSettings={setThemeSettings} />}
                    {activeTab === 'menu_settings' && <MenuSettingsForm links={menuLinks} setLinks={setMenuLinks} />}
                </div>
            </div>
        </div>
    );
};

// --- Sub-forms ---
const SiteInfoForm: React.FC<{settings: SiteSettings, setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>}> = ({settings, setSettings}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings(p => ({...p, [e.target.name]: e.target.value}));
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="admin-form-group"><label>Tên công ty</label><input type="text" name="companyName" value={settings.companyName} onChange={handleChange} /></div>
            <div className="admin-form-group"><label>Slogan</label><input type="text" name="companySlogan" value={settings.companySlogan} onChange={handleChange} /></div>
            <div className="admin-form-group"><label>Số điện thoại</label><input type="text" name="companyPhone" value={settings.companyPhone} onChange={handleChange} /></div>
            <div className="admin-form-group"><label>Email</label><input type="email" name="companyEmail" value={settings.companyEmail} onChange={handleChange} /></div>
            <div className="admin-form-group md:col-span-2"><label>Địa chỉ</label><input type="text" name="companyAddress" value={settings.companyAddress} onChange={handleChange} /></div>
            <div className="admin-form-group"><label>Facebook URL</label><input type="text" name="socialFacebookUrl" value={settings.socialFacebookUrl} onChange={handleChange} /></div>
            <div className="admin-form-group"><label>Zalo URL</label><input type="text" name="socialZaloUrl" value={settings.socialZaloUrl} onChange={handleChange} /></div>
        </div>
    );
}

const ThemeSettingsForm: React.FC<{settings: SiteThemeSettings, setSettings: React.Dispatch<React.SetStateAction<SiteThemeSettings>>}> = ({settings, setSettings}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings(p => ({...p, [e.target.name]: e.target.value}));
    }
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Object.entries(settings).map(([key, value]) => (
                <div key={key} className="admin-form-group">
                    <label className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                    <div className="flex items-center gap-2">
                        <input type="color" name={key} value={value} onChange={handleChange} className="w-10 h-10 p-1" />
                        <input type="text" name={key} value={value} onChange={handleChange} className="font-mono text-sm" />
                    </div>
                </div>
            ))}
        </div>
    );
}

const MenuSettingsForm: React.FC<{links: CustomMenuLink[], setLinks: React.Dispatch<React.SetStateAction<CustomMenuLink[]>>}> = ({links, setLinks}) => {
    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newLinks = [...links];
        const item = newLinks[index];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= newLinks.length) return;
        newLinks[index] = newLinks[swapIndex];
        newLinks[swapIndex] = item;
        setLinks(newLinks.map((link, idx) => ({...link, order: idx + 1})));
    };
    const handleChange = (id: string, field: 'label' | 'path' | 'isVisible', value: string | boolean) => {
        setLinks(links.map(link => link.id === id ? {...link, [field]: value} : link));
    }

    return (
        <div>
            {links.map((link, index) => (
                <div key={link.id} className="flex items-center gap-2 p-2 border-b">
                    <div className="flex flex-col gap-1">
                        <Button type="button" size="sm" variant="ghost" onClick={() => handleMove(index, 'up')} disabled={index === 0}><i className="fas fa-arrow-up"></i></Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => handleMove(index, 'down')} disabled={index === links.length - 1}><i className="fas fa-arrow-down"></i></Button>
                    </div>
                    <input type="text" value={link.label} onChange={e => handleChange(link.id, 'label', e.target.value)} className="w-1/3" />
                    <input type="text" value={link.path} onChange={e => handleChange(link.id, 'path', e.target.value)} className="flex-grow" />
                    <label className="flex items-center"><input type="checkbox" checked={link.isVisible} onChange={e => handleChange(link.id, 'isVisible', e.target.checked)} className="w-4 h-4 mr-2" /> Hiển thị</label>
                </div>
            ))}
        </div>
    );
}

export default SiteSettingsView;
