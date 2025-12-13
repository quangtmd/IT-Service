
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Button from '../../ui/Button';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import { SITE_CONFIG_STORAGE_KEY, INITIAL_SITE_SETTINGS } from '../../../constants';
import { SiteSettings } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';
import { Canvas } from '@react-three/fiber';
import HolographicGridScene from '../three/HolographicGridScene';

const HomeContactIts: React.FC = () => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
  const [sectionRef, isSectionVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  const { addAdminNotification } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contactConfig = siteSettings.homepageContactSection;

  const loadSiteSettings = useCallback(() => {
    const storedSettingsRaw = localStorage.getItem(SITE_CONFIG_STORAGE_KEY);
    if (storedSettingsRaw) {
      setSiteSettings(JSON.parse(storedSettingsRaw));
    } else {
      setSiteSettings(INITIAL_SITE_SETTINGS);
    }
  }, []);

  useEffect(() => {
    loadSiteSettings();
    window.addEventListener('siteSettingsUpdated', loadSiteSettings);
    return () => {
      window.removeEventListener('siteSettingsUpdated', loadSiteSettings);
    };
  }, [loadSiteSettings]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.subject.trim()) {
        setError("Vui lòng điền đầy đủ các trường bắt buộc.");
        return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError("Địa chỉ email không hợp lệ.");
        return;
    }
    if (!/^\d{10,11}$/.test(formData.phone)) {
        setError("Số điện thoại không hợp lệ (cần 10-11 chữ số).");
        return;
    }


    console.log("Homepage Contact Form (Consultation):", formData);
    addAdminNotification(`Yêu cầu tư vấn từ trang chủ: ${formData.name} (Email: ${formData.email}, SĐT: ${formData.phone}, Chủ đề: ${formData.subject}). Nội dung: ${formData.message.substring(0,30)}...`, 'info');
    setIsSubmitted(true);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' }); 
  };

  if (!contactConfig.enabled) return null;

  return (
    <section ref={sectionRef} className={`home-section relative bg-slate-900 text-white animate-on-scroll fade-in-up ${isSectionVisible ? 'is-visible' : ''}`}>
        <div className="absolute inset-0 z-0 opacity-40">
            <Canvas>
                <Suspense fallback={null}>
                    <HolographicGridScene />
                </Suspense>
            </Canvas>
        </div>
        <div className="container mx-auto px-4 relative z-10">
            <div className={`home-section-title-area animate-on-scroll fade-in-up ${isSectionVisible ? 'is-visible' : ''}`}>
                {contactConfig.preTitle && (
                    <span className="home-section-pretitle bg-black/40 backdrop-blur-md border border-primary/30 text-primary">
                        {contactConfig.sectionTitleIconUrl && <img src={contactConfig.sectionTitleIconUrl} alt="" className="w-7 h-7 mr-2 object-contain" />}
                        {contactConfig.preTitle}
                    </span>
                )}
                <h2 className="home-section-title text-4xl md:text-5xl font-extrabold text-white">
                    {contactConfig.title || "Liên Lạc"}
                </h2>
                <p className="home-section-subtitle text-gray-300">
                    Chúng tôi ở đây để giúp đỡ. Gửi tin nhắn cho chúng tôi hoặc liên hệ qua các kênh của chúng tôi.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
                {/* Contact Form */}
                <div className={`lg:w-1/2 w-full animate-on-scroll ${isSectionVisible ? 'slide-in-left is-visible' : 'slide-in-left'}`} style={{animationDelay:'0.1s'}}>
                    {isSubmitted ? (
                        <div className="bg-slate-800/50 backdrop-blur-lg p-8 rounded-xl shadow-xl text-center border-2 border-success-border h-full flex flex-col justify-center items-center">
                            <i className="fas fa-check-circle text-7xl text-success-text mb-6"></i>
                            <h3 className="text-2xl font-semibold text-white mb-3">Yêu cầu đã được gửi!</h3>
                            <p className="text-gray-300 mb-8">Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.</p>
                            <Button onClick={() => setIsSubmitted(false)} variant="outline" className="border-primary text-primary hover:bg-primary/10 shadow-md">Gửi yêu cầu khác</Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-lg p-8 md:p-10 rounded-xl shadow-xl space-y-5 border border-white/10 h-full flex flex-col">
                             <h3 className="text-xl font-semibold text-white mb-1 text-center">Đăng Ký Nhận Tư Vấn</h3>
                            {error && <p className="text-sm text-danger-text bg-danger-bg p-3 rounded-md border border-danger-border">{error}</p>}
                            <div>
                                <label htmlFor="home_contact_name" className="sr-only">Họ và tên</label>
                                <input type="text" name="name" id="home_contact_name" value={formData.name} onChange={handleChange} placeholder="Họ và tên *" className="input-style-dark" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="home_contact_email" className="sr-only">Email</label>
                                    <input type="email" name="email" id="home_contact_email" value={formData.email} onChange={handleChange} placeholder="Email *" className="input-style-dark" />
                                </div>
                                <div>
                                    <label htmlFor="home_contact_phone" className="sr-only">Số điện thoại</label>
                                    <input type="tel" name="phone" id="home_contact_phone" value={formData.phone} onChange={handleChange} placeholder="Số điện thoại *" className="input-style-dark" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="home_contact_subject" className="sr-only">Chủ đề</label>
                                <input type="text" name="subject" id="home_contact_subject" value={formData.subject} onChange={handleChange} placeholder="Chủ đề cần tư vấn *" className="input-style-dark" />
                            </div>
                            <div>
                                <label htmlFor="home_contact_message" className="sr-only">Nội dung chi tiết (tùy chọn)</label>
                                <textarea name="message" id="home_contact_message" rows={3} value={formData.message} onChange={handleChange} placeholder="Nội dung chi tiết (tùy chọn)" className="input-style-dark flex-grow"></textarea>
                            </div>
                            <Button type="submit" variant="primary" size="lg" className="w-full py-3 text-base mt-auto shadow-lg hover:shadow-primary/40">
                                Gửi Yêu Cầu <i className="fas fa-paper-plane ml-2"></i>
                            </Button>
                        </form>
                    )}
                </div>
                {/* Contact Info */}
                <div className={`lg:w-1/2 w-full animate-on-scroll ${isSectionVisible ? 'slide-in-right is-visible' : 'slide-in-right'}`} style={{animationDelay:'0.2s'}}>
                    <div className="bg-slate-800/50 backdrop-blur-lg p-8 md:p-10 rounded-xl shadow-xl space-y-6 border border-white/10 h-full">
                        <h3 className="text-2xl font-semibold text-white mb-4">Thông Tin Liên Hệ Khác</h3>
                        {[
                            { icon: 'fas fa-phone-alt', title: 'Điện thoại:', content: siteSettings.companyPhone, href: `tel:${siteSettings.companyPhone.replace(/\./g, '')}` },
                            { icon: 'fas fa-envelope', title: 'Email:', content: siteSettings.companyEmail, href: `mailto:${siteSettings.companyEmail}` },
                            { icon: 'fas fa-map-marker-alt', title: 'Địa chỉ:', content: siteSettings.companyAddress, href: '#' } 
                        ].map((info, index) => (
                            <div key={index} className="flex items-start py-3">
                                <div className="flex-shrink-0 mr-5 modern-card-icon-wrapper !w-12 !h-12 !p-3 bg-primary/10 border border-primary/20">
                                    <i className={`${info.icon} text-primary !text-xl`}></i>
                                </div>
                                <div>
                                    <span className="block text-sm font-semibold text-gray-400 mb-0.5">{info.title}</span>
                                    <a href={info.href} className="text-lg font-medium text-white hover:text-primary transition-colors break-words leading-tight">{info.content}</a>
                                </div>
                            </div>
                        ))}
                         <div className="mt-6 pt-6 border-t border-white/10">
                            <h4 className="text-md font-semibold text-white mb-2">Giờ làm việc:</h4>
                            <p className="text-gray-300">{siteSettings.workingHours || "Thứ 2 - Thứ 7: 8:00 - 18:00"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
};

export default HomeContactIts;
