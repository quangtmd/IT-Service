
import React, { useState, useEffect, useCallback } from 'react';
import * as Constants from '../../constants';
import { SiteSettings } from '../../types';
import AIChatbot from '../chatbot/AIChatbot';
import { useLocation, useNavigate } from 'react-router-dom';

// Updated to a cute 3D Robot image
const ROBOT_3D_ICON = "https://cdn3d.iconscout.com/3d/free/thumb/free-robot-9058234-7455494.png";

const WELCOME_MESSAGES = [
    "Xin chào! 👋",
    "Cần tư vấn PC? 🖥️",
    "Săn sale sốc? 🎁",
    "Hỏi tôi ngay! 🤖",
    "Tra cứu đơn hàng? 📦"
];

const FloatingActionButtons: React.FC = () => {
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [fadeClass, setFadeClass] = useState('opacity-100'); // Controls opacity for smooth text transitions
    const location = useLocation();
    
    const isAiEnabled = process.env.API_KEY && process.env.API_KEY !== 'undefined';

    const loadSiteSettings = useCallback(() => {
        const storedSettingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
        if (storedSettingsRaw) {
            setSiteSettings(JSON.parse(storedSettingsRaw));
        }
    }, []);

    useEffect(() => {
        loadSiteSettings();
        window.addEventListener('siteSettingsUpdated', loadSiteSettings);
        return () => window.removeEventListener('siteSettingsUpdated', loadSiteSettings);
    }, [loadSiteSettings]);
    
    // Carousel Text Effect - Changing text every few seconds with fade animation
    useEffect(() => {
        if (!isAiEnabled || isChatOpen) return;
        const intervalId = setInterval(() => {
            setFadeClass('opacity-0 translate-y-1'); // Fade out & slight move down
            setTimeout(() => {
                setCurrentMessageIndex((prev) => (prev + 1) % WELCOME_MESSAGES.length);
                setFadeClass('opacity-100 translate-y-0'); // Fade in & move up
            }, 300); // Wait for fade out to complete
        }, 4000);
        return () => clearInterval(intervalId);
    }, [isAiEnabled, isChatOpen]);

    // Auto open chat once per session on homepage
    useEffect(() => {
        if (isAiEnabled && location.pathname === '/') { 
            const alreadyOpened = sessionStorage.getItem(Constants.CHATBOT_AUTO_OPENED_KEY);
            if (!alreadyOpened) {
              const timer = setTimeout(() => {
                setIsChatOpen(true); 
                sessionStorage.setItem(Constants.CHATBOT_AUTO_OPENED_KEY, 'true');
              }, 5000);
              return () => clearTimeout(timer);
            }
        }
    }, [isAiEnabled, location.pathname]);

    const quickContactClasses = "w-11 h-11 text-white rounded-full p-2.5 shadow-lg transition-all duration-300 flex items-center justify-center text-lg hover:scale-110";

    return (
        <>
            <div className={`fixed bottom-6 right-4 z-[60] flex flex-col items-end space-y-3 transition-all duration-500 ${isChatOpen ? 'translate-y-20 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
                {/* Secondary Contact Buttons */}
                <div className="flex flex-col space-y-2 items-end">
                    {siteSettings.companyPhone && (
                        <a href={`tel:${siteSettings.companyPhone.replace(/\./g, '')}`} className={`${quickContactClasses} bg-green-500 hover:bg-green-600`} title="Gọi ngay">
                            <i className="fas fa-phone-alt"></i>
                        </a>
                    )}
                    {siteSettings.socialZaloUrl && (
                        <a href={siteSettings.socialZaloUrl} target="_blank" rel="noopener noreferrer" className={`${quickContactClasses} bg-blue-500 hover:bg-blue-600`} title="Chat Zalo">
                            <i className="fas fa-comment-dots"></i>
                        </a>
                    )}
                </div>
                
                {/* AI Chatbot Button */}
                {isAiEnabled && (
                    <div className="relative flex items-center cursor-pointer group" onClick={() => setIsChatOpen(true)}>
                        {/* Animated Bubble with Carousel Text */}
                        <div className="mr-3 bg-white text-gray-800 px-4 py-2 rounded-2xl rounded-br-none shadow-xl border border-gray-100 flex items-center max-w-[200px] transform transition-transform group-hover:scale-105 origin-bottom-right">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse shrink-0"></span>
                            <p className={`text-sm font-bold whitespace-nowrap transition-all duration-300 ease-in-out ${fadeClass}`} style={{fontFamily: 'Inter, sans-serif'}}>
                                {WELCOME_MESSAGES[currentMessageIndex]}
                            </p>
                        </div>

                        {/* 3D Robot Icon Only - No Red Ring */}
                        <button 
                            onClick={() => setIsChatOpen(true)} 
                            className="w-24 h-24 flex items-center justify-center focus:outline-none transform hover:scale-110 transition-transform duration-300 relative z-10"
                            aria-label="Mở Chatbot AI" 
                            title="Trợ lý AI"
                        >
                            {/* Define Wiggle Animation */}
                            <style>{`
                                @keyframes robotWiggle {
                                    0%, 100% { transform: rotate(-8deg); }
                                    50% { transform: rotate(8deg); }
                                }
                            `}</style>
                            
                            {/* Robot Image with Wiggle Animation */}
                            <img 
                                src={ROBOT_3D_ICON} 
                                alt="AI Assistant" 
                                className="w-full h-full object-contain filter drop-shadow-2xl"
                                style={{ animation: 'robotWiggle 3s ease-in-out infinite' }}
                            />
                        </button>
                    </div>
                )}
            </div>

            {isAiEnabled && <AIChatbot isOpen={isChatOpen} setIsOpen={setIsChatOpen} />}
        </>
    );
};

export default FloatingActionButtons;
