import React, { useState, useEffect, useCallback } from 'react';
import * as Constants from '../../constants';
import { SiteSettings } from '../../types';
import AIChatbot from '../chatbot/AIChatbot';

const FloatingActionButtons: React.FC = () => {
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
    const [isChatOpen, setIsChatOpen] = useState(false);
    
    // CORRECTED: This check now correctly uses Vite's env variables to determine if the AI feature is available.
    const isAiEnabled = import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY !== 'undefined';

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
        if (isAiEnabled) { // Only auto-open if AI is enabled
            const alreadyOpened = localStorage.getItem(Constants.CHATBOT_AUTO_OPENED_KEY);
            if (!alreadyOpened) {
              setIsChatOpen(true);
              localStorage.setItem(Constants.CHATBOT_AUTO_OPENED_KEY, 'true');
            }
        }
    }, [isAiEnabled]);

    const quickContactCommonClasses = "w-14 h-14 text-white rounded-full p-3.5 shadow-lg transition-all duration-300 flex items-center justify-center text-xl transform hover:scale-110";
    const fabVisibilityClass = isChatOpen ? 'opacity-0 scale-0 pointer-events-none' : 'opacity-100 scale-100';

    return (
        <>
            <div className={`fixed bottom-6 right-6 z-[60] flex flex-col items-center space-y-3 transition-all duration-300 ${fabVisibilityClass}`}>
                {siteSettings.companyPhone && (
                    <a href={`tel:${siteSettings.companyPhone.replace(/\./g, '')}`} className={`${quickContactCommonClasses} bg-green-500 hover:bg-green-600 animate-subtle-beat`} aria-label="Call Now" title={siteSettings.companyPhone}>
                        <i className="fas fa-phone-alt"></i>
                    </a>
                )}
                {siteSettings.socialZaloUrl && (
                    <a href={siteSettings.socialZaloUrl} target="_blank" rel="noopener noreferrer" className={`${quickContactCommonClasses} bg-blue-500 hover:bg-blue-600`} aria-label="Chat on Zalo" title="Chat on Zalo">
                        <i className="fas fa-comment-dots"></i>
                    </a>
                )}
                {siteSettings.socialFacebookUrl && (
                    <a href={siteSettings.socialFacebookUrl.includes('m.me') || siteSettings.socialFacebookUrl.includes('messenger.com') ? siteSettings.socialFacebookUrl : `https://m.me/${siteSettings.socialFacebookUrl.split('/').pop()}`} target="_blank" rel="noopener noreferrer" className={`${quickContactCommonClasses} bg-blue-600 hover:bg-blue-700`} aria-label="Chat on Messenger" title="Chat on Messenger">
                        <i className="fab fa-facebook-messenger"></i>
                    </a>
                )}
                {isAiEnabled && (
                     <button onClick={() => setIsChatOpen(true)} className={`${quickContactCommonClasses} bg-primary hover:bg-primary-dark`} aria-label="Toggle Chatbot" title="Mở Chatbot AI">
                        <i className="fas fa-comments"></i>
                    </button>
                )}
            </div>

            {isAiEnabled && <AIChatbot isOpen={isChatOpen} setIsOpen={setIsChatOpen} />}
        </>
    );
};

export default FloatingActionButtons;
