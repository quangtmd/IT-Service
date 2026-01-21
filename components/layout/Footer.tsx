

import React, { useState, useEffect, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom'; // Link is compatible with v6/v7
import * as Constants from '../../constants'; 
import { SiteSettings } from '../../types';

const Footer: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);

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

  const socialLinksData = [
    { name: 'Facebook', iconClass: "fab fa-facebook-f", url: settings.socialFacebookUrl },
    { name: 'Zalo', iconClass: "fas fa-comment-dots", url: settings.socialZaloUrl }, 
    { name: 'YouTube', iconClass: "fab fa-youtube", url: settings.socialYoutubeUrl },
    { name: 'Instagram', iconClass: "fab fa-instagram", url: settings.socialInstagramUrl },
    { name: 'Twitter', iconClass: "fab fa-twitter", url: settings.socialTwitterUrl },
  ].filter(link => link.url && link.url.trim() !== '');


  return (
    <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-700">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-100 mb-4">{settings.companyName}</h3>
            <p className="text-sm text-gray-400 mb-4">
              {settings.companySlogan || "Cung cấp linh kiện PC chất lượng cao và dịch vụ IT chuyên nghiệp."}
            </p>
            {socialLinksData.length > 0 && (
                <div className="flex space-x-4">
                {socialLinksData.map(link => (
                    <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" title={link.name} className="text-gray-400 hover:text-primary transition-colors text-xl">
                    <i className={link.iconClass}></i>
                    </a>
                ))}
                </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              {Constants.NAVIGATION_LINKS_BASE.slice(0, 6).map(link => (
                 <li key={link.path}>
                   <ReactRouterDOM.Link to={link.path} className="hover:text-primary transition-colors text-sm text-gray-400">{link.label}</ReactRouterDOM.Link>
                 </li>
              ))}
            </ul>
          </div>

           <div>
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Dịch vụ chính</h3>
            <ul className="space-y-2 text-sm">
              <li><ReactRouterDOM.Link to="/services" className="hover:text-primary transition-colors text-gray-400">Sửa PC, Laptop</ReactRouterDOM.Link></li>
              <li><ReactRouterDOM.Link to="/services" className="hover:text-primary transition-colors text-gray-400">Nâng cấp máy tính</ReactRouterDOM.Link></li>
              <li><ReactRouterDOM.Link to="/services" className="hover:text-primary transition-colors text-gray-400">Bảo trì hệ thống doanh nghiệp</ReactRouterDOM.Link></li>
              <li><ReactRouterDOM.Link to="/pc-builder" className="hover:text-primary transition-colors text-gray-400">Xây dựng cấu hình PC</ReactRouterDOM.Link></li>
              <li><ReactRouterDOM.Link to="/projects" className="hover:text-primary transition-colors text-gray-400">Giải pháp Camera, Mạng</ReactRouterDOM.Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Thông Tin Liên Hệ</h3>
            <address className="not-italic text-sm space-y-2 text-gray-400">
              <p><i className="fas fa-map-marker-alt mr-2 text-primary"></i>{settings.companyAddress}</p>
              <p><i className="fas fa-phone-alt mr-2 text-primary"></i>Hotline: <a href={`tel:${settings.companyPhone.replace(/\./g, '')}`} className="hover:text-primary">{settings.companyPhone}</a></p>
              <p><i className="fas fa-envelope mr-2 text-primary"></i>Email: <a href={`mailto:${settings.companyEmail}`} className="hover:text-primary">{settings.companyEmail}</a></p>
              {settings.workingHours && <p><i className="fas fa-clock mr-2 text-primary"></i>{settings.workingHours}</p>}
            </address>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-700 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} {settings.companyName}. Bảo lưu mọi quyền.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
