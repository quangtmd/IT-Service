import React, { useState, useCallback } from 'react';
import { SiteSettings } from '../../types';
import * as Constants from '../../constants';
import Button from '../ui/Button';
import BannerSettingsForm from './homepage_management/BannerSettingsForm';
import AboutSettingsForm from './homepage_management/AboutSettingsForm';
import ServicesBenefitsSettingsForm from './homepage_management/ServicesBenefitsSettingsForm';
import WhyChooseUsSettingsForm from './homepage_management/WhyChooseUsSettingsForm';
import StatsCounterSettingsForm from './homepage_management/StatsCounterSettingsForm';
import TestimonialsSettingsForm from './homepage_management/TestimonialsSettingsForm';
import FeaturedProjectsSettingsForm from './homepage_management/FeaturedProjectsSettingsForm';
import BrandLogosSettingsForm from './homepage_management/BrandLogosSettingsForm';
import ProcessSettingsForm from './homepage_management/ProcessSettingsForm';
import CallToActionSettingsForm from './homepage_management/CallToActionSettingsForm';
import BlogPreviewSettingsForm from './homepage_management/BlogPreviewSettingsForm';
import ContactSectionSettingsForm from './homepage_management/ContactSectionSettingsForm';


type HomepageTab = 'banners' | 'about' | 'services_benefits' | 'why_choose_us' | 'stats_counter' | 'featured_projects' | 'testimonials' | 'brand_logos' | 'process' | 'cta' | 'blog_preview' | 'contact';

const TABS: { id: HomepageTab; label: string }[] = [
    { id: 'banners', label: 'Banners' },
    { id: 'about', label: 'Giới thiệu' },
    { id: 'services_benefits', label: 'Lợi ích Dịch vụ' },
    { id: 'why_choose_us', label: 'Vì sao chọn IQ' },
    { id: 'stats_counter', label: 'Thống kê' },
    { id: 'featured_projects', label: 'Dịch vụ nổi bật' },
    { id: 'testimonials', label: 'Đánh giá' },
    { id: 'brand_logos', label: 'Đối tác' },
    { id: 'process', label: 'Quy trình' },
    { id: 'cta', label: 'Kêu gọi hành động' },
    { id: 'blog_preview', label: 'Xem trước Blog' },
    { id: 'contact', label: 'Thông tin Liên hệ' },
];

const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
    try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : defaultValue; }
    catch (error) { console.error(`Lỗi đọc localStorage key "${key}":`, error); return defaultValue; }
};

const HomepageManagementView: React.FC = () => {
    const [settings, setSettings] = useState<SiteSettings>(() => getLocalStorageItem(Constants.SITE_CONFIG_STORAGE_KEY, Constants.INITIAL_SITE_SETTINGS));
    const [activeTab, setActiveTab] = useState<HomepageTab>('banners');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    const handleSave = () => {
        if (window.confirm('Bạn có chắc chắn muốn lưu tất cả các thay đổi cho nội dung trang chủ không?')) {
            setSaveStatus('saving');
            try {
                localStorage.setItem(Constants.SITE_CONFIG_STORAGE_KEY, JSON.stringify(settings));
                window.dispatchEvent(new CustomEvent('siteSettingsUpdated'));
                setSaveStatus('success');
            } catch (error) {
                setSaveStatus('error');
                console.error("Failed to save homepage settings:", error);
            } finally {
                setTimeout(() => setSaveStatus('idle'), 2000);
            }
        }
    };
    
    const handleSectionChange = useCallback((sectionKey: keyof SiteSettings, newSectionSettings: any) => {
        setSettings(prev => ({
            ...prev,
            [sectionKey]: newSectionSettings,
        }));
    }, []);

    const renderSaveButton = () => {
        switch(saveStatus) {
            case 'saving': return <Button isLoading>Đang lưu...</Button>;
            case 'success': return <Button className="!bg-green-500 !hover:bg-green-600"><i className="fas fa-check mr-2"></i>Đã lưu!</Button>;
            case 'error': return <Button className="!bg-red-500 !hover:bg-red-600">Lỗi!</Button>;
            default: return <Button onClick={handleSave}>Lưu thay đổi</Button>;
        }
    };
    
    const renderContent = () => {
        switch (activeTab) {
            case 'banners': return <BannerSettingsForm banners={settings.homepageBanners} onChange={(val) => handleSectionChange('homepageBanners', val)} />;
            case 'about': return <AboutSettingsForm about={settings.homepageAbout} onChange={(val) => handleSectionChange('homepageAbout', val)} />;
            case 'services_benefits': return <ServicesBenefitsSettingsForm settings={settings.homepageServicesBenefits} onChange={(val) => handleSectionChange('homepageServicesBenefits', val)} />;
            case 'why_choose_us': return <WhyChooseUsSettingsForm settings={settings.homepageWhyChooseUs} onChange={(val) => handleSectionChange('homepageWhyChooseUs', val)} />;
            case 'stats_counter': return <StatsCounterSettingsForm settings={settings.homepageStatsCounter} onChange={(val) => handleSectionChange('homepageStatsCounter', val)} />;
            case 'testimonials': return <TestimonialsSettingsForm settings={settings.homepageTestimonials} onChange={(val) => handleSectionChange('homepageTestimonials', val)} />;
            case 'featured_projects': return <FeaturedProjectsSettingsForm settings={settings.homepageFeaturedProjects} onChange={(val) => handleSectionChange('homepageFeaturedProjects', val)} />;
            case 'brand_logos': return <BrandLogosSettingsForm settings={settings.homepageBrandLogos} onChange={(val) => handleSectionChange('homepageBrandLogos', val)} />;
            case 'process': return <ProcessSettingsForm settings={settings.homepageProcess} onChange={(val) => handleSectionChange('homepageProcess', val)} />;
            case 'cta': return <CallToActionSettingsForm settings={settings.homepageCallToAction} onChange={(val) => handleSectionChange('homepageCallToAction', val)} />;
            case 'blog_preview': return <BlogPreviewSettingsForm settings={settings.homepageBlogPreview} onChange={(val) => handleSectionChange('homepageBlogPreview', val)} />;
            case 'contact': return <ContactSectionSettingsForm settings={settings.homepageContactSection} onChange={(val) => handleSectionChange('homepageContactSection', val)} />;
            default: return null;
        }
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center flex-wrap gap-2">
                <h3 className="admin-card-title">Quản lý nội dung Trang chủ</h3>
                {renderSaveButton()}
            </div>
            <div className="admin-card-body">
                <nav className="admin-tabs overflow-x-auto scrollbar-hide whitespace-nowrap">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`admin-tab-button ${activeTab === tab.id ? 'active' : ''}`}>
                            {tab.label}
                        </button>
                    ))}
                </nav>
                <div className="mt-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default HomepageManagementView;