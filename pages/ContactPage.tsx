import React, { useState, useEffect, useCallback } from 'react';
import Button from '../components/ui/Button';
import * as Constants from '../constants.tsx';
import { SiteSettings } from '../types';
import { useAuth } from '../contexts/AuthContext';

const ContactPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null); 
  const { addAdminNotification } = useAuth();

  const loadSettings = useCallback(() => {
    const storedSettings = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    } else {
      setSettings(Constants.INITIAL_SITE_SETTINGS);
    }
  },[]);

  useEffect(() => {
    loadSettings();
    window.addEventListener('siteSettingsUpdated', loadSettings);
    return () => {
      window.removeEventListener('siteSettingsUpdated', loadSettings);
    };
  }, [loadSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formError) setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.subject.trim() || !formData.message.trim()) {
        setFormError("Vui lòng điền đầy đủ các trường bắt buộc.");
        return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setFormError("Địa chỉ email không hợp lệ.");
        return;
    }
    if (!/^\d{10,11}$/.test(formData.phone)) {
        setFormError("Số điện thoại không hợp lệ (phải có 10-11 chữ số).");
        return;
    }

    console.log('Dữ liệu form liên hệ:', formData);
    setIsSubmitted(true);
    addAdminNotification(`Tin nhắn liên hệ mới từ: ${formData.name} (Email: ${formData.email}, SĐT: ${formData.phone}). Chủ đề: ${formData.subject.substring(0,30)}${formData.subject.length > 30 ? "..." : ""}`, 'info');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' }); 
  };
  
  const socialLinksConfig = [
    { name: 'Facebook', icon: <i className="fab fa-facebook-f"></i>, url: settings.socialFacebookUrl },
    { name: 'Zalo', icon: <i className="fas fa-comment-dots"></i>, url: settings.socialZaloUrl }, 
    { name: 'YouTube', icon: <i className="fab fa-youtube"></i>, url: settings.socialYoutubeUrl },
    { name: 'Instagram', icon: <i className="fab fa-instagram"></i>, url: settings.socialInstagramUrl },
    { name: 'Twitter', icon: <i className="fab fa-twitter"></i>, url: settings.socialTwitterUrl },
  ].filter(link => link.url && link.url.trim() !== '');


  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-textBase mb-2">{settings.contactPageTitle || "Liên Hệ Với Chúng Tôi"}</h1>
        <p className="text-textMuted max-w-xl mx-auto">
          {settings.contactPageSubtitle || "Chúng tôi luôn sẵn lòng lắng nghe và hỗ trợ bạn. Đừng ngần ngại liên hệ!"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        <div className="space-y-8">
          <div className="bg-bgBase p-6 rounded-lg shadow-md border border-borderDefault">
            <h2 className="text-2xl font-semibold text-textBase mb-4">Thông tin liên hệ</h2>
            <div className="space-y-3 text-textMuted">
              <p><i className="fas fa-map-marker-alt mr-3 text-primary w-5 text-center"></i>{settings.companyAddress}</p>
              <p><i className="fas fa-phone-alt mr-3 text-primary w-5 text-center"></i>Hotline: <a href={`tel:${settings.companyPhone.replace(/\./g, '')}`} className="hover:text-primary">{settings.companyPhone}</a></p>
              <p><i className="fas fa-envelope mr-3 text-primary w-5 text-center"></i>Email: <a href={`mailto:${settings.companyEmail}`} className="hover:text-primary">{settings.companyEmail}</a></p>
              {settings.workingHours && <p><i className="fas fa-clock mr-3 text-primary w-5 text-center"></i>Giờ làm việc: {settings.workingHours}</p>}
            </div>
            {socialLinksConfig.length > 0 && (
                <div className="mt-6 flex space-x-4">
                    {socialLinksConfig.map(link => (
                        <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" title={link.name}
                        className="text-textSubtle hover:text-primary transition-colors text-2xl">
                            {link.icon}
                        </a>
                    ))}
                </div>
            )}
          </div>
          
          {settings.mapEmbedUrl && (
            <div className="bg-bgBase p-6 rounded-lg shadow-md border border-borderDefault">
              <h2 className="text-2xl font-semibold text-textBase mb-4">Vị trí trên bản đồ</h2>
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-sm border border-borderDefault">
                <iframe 
                  src={settings.mapEmbedUrl}
                  width="100%" 
                  height="350" 
                  style={{ border:0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Bản đồ vị trí - ${settings.companyName}`}
                ></iframe>
              </div>
            </div>
          )}
        </div>

        <div className="bg-bgBase p-6 md:p-8 rounded-lg shadow-xl border