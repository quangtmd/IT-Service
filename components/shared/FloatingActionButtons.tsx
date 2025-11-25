
import React, { useState, useEffect, useCallback } from 'react';
import * as Constants from '../../constants';
import { SiteSettings } from '../../types';
import AIChatbot from '../chatbot/AIChatbot';
import { useLocation, useNavigate } from 'react-router-dom';

// Sử dụng ảnh Robot 3D đẹp mắt thay vì SVG đơn điệu
const ROBOT_AVATAR_URL = "https://cdn-icons-png.flaticon.com/512/4712/4712109.png"; 

const WELCOME_MESSAGES = [
    "Xin chào! 👋",
    "Cần tư vấn PC? 🖥️",
    "Săn sale sốc? 🎁",
    "Hỏi tôi ngay! 🤖"
];

const FloatingActionButtons: React.FC = () => {
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [fadeClass, setFadeClass] = useState('opacity-100'); // State để điều khiển hiệu ứng mờ/rõ
    const location = useLocation();
    const navigate = useNavigate();
    
    const isAiEnabled = process.env.API_KEY && process.env.API_KEY !== 'undefined';

    const loadSiteSettings = useCallback(() => {
        const storedSettingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
        if (storedSettingsRaw) {
            setSiteSettings(JSON.parse(storedSettingsRaw));
        } else {
            setSiteSettings(Constants.INITIAL_SITE_SETTINGS);
        }
    }, []);

    useEffect(() => {
        loadSiteSettings();
        window.addEventListener('siteSettingsUpdated', loadSiteSettings);
        return () => {
            window.removeEventListener('siteSettingsUpdated', loadSiteSettings);
        };
    }, [loadSiteSettings]);
    
    // Hiệu ứng chuyển đổi tin nhắn mượt mà (không dùng transform để tránh chữ mờ)
    useEffect(() => {
        if (!isAiEnabled || isChatOpen) return;

        const intervalId = setInterval(() => {
            // 1. Làm mờ chữ hiện tại
            setFadeClass('opacity-0');
            
            setTimeout(() => {
                // 2. Đổi nội dung tin nhắn
                setCurrentMessageIndex((prev) => (prev + 1) % WELCOME_MESSAGES.length);
                // 3. Hiện chữ mới lên
                setFadeClass('opacity-100');
            }, 300); // Thời gian chờ khớp với transition duration

        }, 4000); // Đổi tin nhắn mỗi 4 giây

        return () => clearInterval(intervalId);
    }, [isAiEnabled, isChatOpen]);

    // Tự động mở chat lần đầu (nếu cần)
    useEffect(() => {
        if (isAiEnabled && location.pathname === '/') { 
            const alreadyOpened = sessionStorage.getItem(Constants.CHATBOT_AUTO_OPENED_KEY);
            if (!alreadyOpened) {
              const timer = setTimeout(() => {
                // Logic tự mở chat có thể thêm ở đây nếu muốn
                // setIsChatOpen(true); 
                sessionStorage.setItem(Constants.CHATBOT_AUTO_OPENED_KEY, 'true');
              }, 3000);
              return () => clearTimeout(timer);
            }
        }
    }, [isAiEnabled, location.pathname]);

    const quickContactCommonClasses = "w-12 h-12 text-white rounded-full p-3 shadow-lg transition-transform duration-300 flex items-center justify-center text-lg transform hover:scale-110 hover:-translate-y-1";
    const fabVisibilityClass = isChatOpen ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0';

    return (
        <>
            <div className={`fixed bottom-6 right-6 z-[60] flex flex-col items-end space-y-4 transition-all duration-500 ease-in-out ${fabVisibilityClass} no-print`}>
                {/* Các nút liên hệ phụ (Zalo, Phone...) */}
                <div className="flex flex-col space-y-3 items-end">
                    {siteSettings.companyPhone && (
                        <a href={`tel:${siteSettings.companyPhone.replace(/\./g, '')}`} className={`${quickContactCommonClasses} bg-green-500 hover:bg-green-600`} aria-label="Gọi ngay" title={`Gọi ngay: ${siteSettings.companyPhone}`}>
                            <i className="fas fa-phone-alt"></i>
                        </a>
                    )}
                    {siteSettings.socialZaloUrl && (
                        <a href={siteSettings.socialZaloUrl} target="_blank" rel="noopener noreferrer" className={`${quickContactCommonClasses} bg-blue-500 hover:bg-blue-600`} aria-label="Chat Zalo" title="Chat Zalo">
                            <i className="fas fa-comment-dots"></i>
                        </a>
                    )}
                    {siteSettings.socialFacebookUrl && (
                        <a href={siteSettings.socialFacebookUrl.includes('m.me') || siteSettings.socialFacebookUrl.includes('messenger.com') ? siteSettings.socialFacebookUrl : `https://m.me/${siteSettings.socialFacebookUrl.split('/').pop()}`} target="_blank" rel="noopener noreferrer" className={`${quickContactCommonClasses} bg-blue-600 hover:bg-blue-700`} aria-label="Chat Messenger" title="Chat Messenger">
                            <i className="fab fa-facebook-messenger"></i>
                        </a>
                    )}
                </div>
                
                {/* Nút Chatbot AI Chính */}
                {isAiEnabled && (
                    <div className="relative flex items-center">
                        {/* Bong bóng tin nhắn (Speech Bubble) */}
                        <div 
                            className="mr-4 bg-white text-gray-800 px-4 py-2.5 rounded-2xl rounded-br-none shadow-xl border border-gray-100 flex items-center max-w-[200px] cursor-pointer transform transition-all hover:scale-105 origin-bottom-right"
                            onClick={() => setIsChatOpen(true)}
                        >
                            {/* Dấu chấm xanh trạng thái */}
                            <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2.5 animate-pulse shrink-0"></span>
                            
                            {/* Nội dung tin nhắn thay đổi */}
                            <p className={`text-sm font-bold whitespace-nowrap transition-opacity duration-300 ${fadeClass}`} style={{fontFamily: 'Inter, sans-serif'}}>
                                {WELCOME_MESSAGES[currentMessageIndex]}
                            </p>
                        </div>

                        {/* Nút Robot */}
                        <button 
                            onClick={() => setIsChatOpen(true)} 
                            className="w-16 h-16 bg-gradient-to-br from-primary to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300 relative group"
                            aria-label="Mở Chatbot AI" 
                            title="Trợ lý AI"
                        >
                            {/* Hiệu ứng Ping (sóng lan tỏa) */}
                            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-20 animate-ping"></span>
                            
                            {/* Ảnh Robot */}
                            <img 
                                src={ROBOT_AVATAR_URL} 
                                alt="AI Chatbot" 
                                className="w-10 h-10 object-contain filter drop-shadow-md group-hover:rotate-12 transition-transform duration-300" 
                            />
                            
                            {/* Badge thông báo (nếu cần) */}
                            <span className="absolute top-0 right-0 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500 border-2 border-white"></span>
                            </span>
                        </button>
                    </div>
                )}
            </div>

            {isAiEnabled && <AIChatbot isOpen={isChatOpen} setIsOpen={setIsChatOpen} />}
        </>
    );
};

export default FloatingActionButtons;
