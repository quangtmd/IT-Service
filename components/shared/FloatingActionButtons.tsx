import React, { useState, useEffect, useCallback } from 'react';
import * as Constants from '../../constants.tsx';
import { SiteSettings } from '../../types';
import AIChatbot from '../chatbot/AIChatbot';

const FloatingActionButtons: React.FC = () => {
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isContactMenuOpen, setIsContactMenuOpen] = useState(false);
    const [showInitialBubble, setShowInitialBubble] = useState(false);
    
    // This check determines if the AI feature is available.
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
    
    useEffect(() => {
        if (isAiEnabled) {
            const showTimer = setTimeout(() => {
                // Don't show the bubble if the chat is already open
                if (!isChatOpen) {
                    setShowInitialBubble(true);
                }
            }, 2000); // Show after 2 seconds

            const hideTimer = setTimeout(() => {
                setShowInitialBubble(false);
            }, 12000); // Hide after 10 more seconds

            return () => {
                clearTimeout(showTimer);
                clearTimeout(hideTimer);
            };
        }
    }, [isAiEnabled, isChatOpen]);

    const quickContactCommonClasses = "w-14 h-14 text-white rounded-full p-3.5 shadow-lg flex items-center justify-center text-xl transition-all duration-300 transform hover:scale-110";
    const fabVisibilityClass = isChatOpen ? 'opacity-0 scale-0 pointer-events-none' : 'opacity-100 scale-100';

    const contactLinks = [
        { name: 'Facebook', href: siteSettings.socialFacebookUrl?.includes('m.me') || siteSettings.socialFacebookUrl?.includes('messenger.com') ? siteSettings.socialFacebookUrl : `https://m.me/${siteSettings.socialFacebookUrl?.split('/').pop()}`, icon: 'fab fa-facebook-messenger', color: 'bg-blue-600 hover:bg-blue-700', enabled: !!siteSettings.socialFacebookUrl },
        { name: 'Zalo', href: siteSettings.socialZaloUrl, icon: 'fas fa-comment-dots', color: 'bg-blue-500 hover:bg-blue-600', enabled: !!siteSettings.socialZaloUrl },
        { name: 'Phone', href: `tel:${siteSettings.companyPhone?.replace(/\./g, '')}`, icon: 'fas fa-phone-alt', color: 'bg-green-500 hover:bg-green-600', enabled: !!siteSettings.companyPhone },
    ].filter(link => link.enabled);

    return (
        <>
            <div className={`fixed bottom-6 right-6 z-[60] flex flex-col items-center space-y-3 transition-all duration-300 ${fabVisibilityClass}`}>
                
                {/* Expanding Contact Menu */}
                <div 
                    className="relative flex flex-col items-center"
                    onMouseEnter={() => setIsContactMenuOpen(true)}
                    onMouseLeave={() => setIsContactMenuOpen(false)}
                >
                    <div className="absolute bottom-0 flex flex-col items-center space-y-3">
                        {contactLinks.map((link, index) => (
                            <a
                                key={link.name}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${quickContactCommonClasses} ${link.color} ${isContactMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'}`}
                                style={{ transform: isContactMenuOpen ? `translateY(-${(index + 1) * 4.25}rem)` : 'translateY(0)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                                aria-label={`Chat on ${link.name}`}
                                title={link.name}
                            >
                                <i className={link.icon}></i>
                            </a>
                        ))}
                    </div>

                    <button className={`${quickContactCommonClasses} bg-gray-700 hover:bg-gray-800 relative z-10`}>
                        <i className={`fas ${isContactMenuOpen ? 'fa-times' : 'fa-headset'} transition-all duration-300 ${isContactMenuOpen ? 'rotate-90' : ''}`}></i>
                    </button>
                </div>
                
                {/* AI Chatbot Button */}
                {isAiEnabled && (
                     <div className="relative group">
                        <div className={`
                            absolute bottom-2 right-[70px] w-max max-w-[200px] text-center
                            bg-white text-primary text-sm font-semibold
                            py-2 px-4 rounded-lg shadow-lg
                            transition-all duration-300 origin-right
                            ${showInitialBubble ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}
                            group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto
                        `}>
                            Tôi có thể giúp gì cho bạn?
                            <div className="absolute top-1/2 -translate-y-1/2 right-[-6px] h-0 w-0 border-y-8 border-y-transparent border-l-[8px] border-l-white"></div>
                        </div>
                        <button onClick={() => setIsChatOpen(true)} className={`${quickContactCommonClasses} bg-primary hover:bg-primary-dark animate-pulse-red`} aria-label="Toggle Chatbot" title="Mở Chatbot AI">
                            <i className="fas fa-robot"></i>
                        </button>
                    </div>
                )}
            </div>

            {isAiEnabled && <AIChatbot isOpen={isChatOpen} setIsOpen={setIsChatOpen} />}
        </>
    );
};

export default FloatingActionButtons;