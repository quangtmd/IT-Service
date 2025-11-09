import React, { useState, useEffect, useCallback } from 'react';
import * as Constants from '../../constants';
import { SiteSettings } from '../../types';
import AIChatbot from '../chatbot/AIChatbot';
import * as ReactRouterDOM from 'react-router-dom';

// Base64 encoded SVG for a simple robot icon
const ROBOT_ICON_SVG_BASE64 = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIj4KICA8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMCAxOGMtNC40MSAwLTgtMy41OS04LThzMy41OS04IDgtOCA4IDMuNTkgOCA4IDguMzU5IDggOC04eiBNOSAxMy41Yy0uODMgMC0xLjUtLjY3LTEuNS0xLjVzLjY3LTEuNSAxLjUtMS41IDEuNS42NyAxLjUgMS41LS42NyAxLjUtMS41IDEuNXptNiAwYy0uODMgMC0xLjUtLjY3LTEuNS0xLjVzLjY3LTEuNSAxLjUtMS41IDEuNS42NyAxLjUgMS41LS42NyAxLjUtMS41IDEuNXpNMTIgMTdjLTIuMzMgMC0zLjM3LTEuMDctMy45Mi0xLjc0LS4xMy0uMTYtLjItLjM2LS4yLS41NiAwLS4yNS4xLS40Ny4yOC0uNjUuMjUtLjI2LjY1LS4zNyAxLjA1LS4yNy40Mi4xLjguMzggMS4xMy43OC4zMy0uNC43MS0uNjggMS4xMy0uNzguNC0uMS44LS4wMSAxLjA1LjI3LjE4LjE4LjI4LjQuMjguNjUgMCAuMi0uMDcuNC0uMi41Ni0wLjU1LjY3LTEuNTkgMS43NC0zLjkyIDEuNzR6TTE2IDhoLTFjLS41NSAwLTEgLjQ1LTEgMXMuNDUgMSAxIDFoMWMuNTUgMCAxLS40NSAxLTFzLS40NS0xLTF6TTguMDA0IDhoLTEuMDAxYy0uNTQ5IDAtLjk5OS40NS0uOTk5IDFzLjQ1Ljk5OS45OTkuOTk5aDEuMDAxYy41NDkgMC45OTkuOTk5LS40NS45OTktMS4wMDFzLS40NS0uOTk5LS45OTktLjk5OXoiLz4KPC9zdmc+`;


const FloatingActionButtons: React.FC = () => {
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [showWelcomeBubble, setShowWelcomeBubble] = useState(false);
    const location = ReactRouterDOM.useLocation();
    
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
        let showTimer: number;
        let hideTimer: number;

        // Only show bubble on the homepage and if AI is enabled
        if (isAiEnabled && (location.pathname === '/home' || location.pathname === '/')) {
            const alreadyShown = sessionStorage.getItem(Constants.CHATBOT_AUTO_OPENED_KEY);
            if (!alreadyShown) {
                // Show the welcome bubble after a delay
                showTimer = window.setTimeout(() => {
                    setShowWelcomeBubble(true);
                    sessionStorage.setItem(Constants.CHATBOT_AUTO_OPENED_KEY, 'true');

                    // Hide the bubble after it has been shown for a while
                    hideTimer = window.setTimeout(() => {
                        setShowWelcomeBubble(false);
                    }, 5000); // Show for 5 seconds
                }, 1500); // Initial delay before showing bubble
            }
        } else {
            // If not on the homepage, ensure the bubble is not shown
            setShowWelcomeBubble(false);
        }

        // Cleanup function to clear timeouts if component unmounts or location changes
        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
    }, [isAiEnabled, location.pathname]);


    const quickContactCommonClasses = "w-14 h-14 text-white rounded-full p-3.5 shadow-lg transition-all duration-300 flex items-center justify-center text-xl transform hover:scale-110";
    const fabVisibilityClass = isChatOpen ? 'opacity-0 scale-0 pointer-events-none' : 'opacity-100 scale-100';

    return (
        <>
            <div className={`fixed bottom-6 right-6 z-[60] flex flex-col items-center space-y-3 transition-all duration-300 ${fabVisibilityClass}`}>
                {siteSettings.companyPhone && (
                    <a href={`tel:${siteSettings.companyPhone.replace(/\./g, '')}`} className={`${quickContactCommonClasses} bg-green-500 hover:bg-green-600`} aria-label="Call Now" title={siteSettings.companyPhone}>
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
                    <>
                        {showWelcomeBubble && (
                            <div className="absolute right-full mr-4 bottom-0 mb-3 bg-white text-textBase p-3 rounded-lg shadow-lg animate-fade-in-out text-sm whitespace-nowrap z-50 pointer-events-none">
                                <p>Bạn cần tôi hỗ trợ gì?</p>
                                <div className="absolute right-[-8px] bottom-4 w-0 h-0 border-l-[10px] border-l-white border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent"></div>
                            </div>
                        )}
                        <button 
                            onClick={() => setIsChatOpen(true)} 
                            className={`${quickContactCommonClasses} bg-primary hover:bg-primary-dark animate-subtle-pulse`} 
                            aria-label="Toggle Chatbot" 
                            title="Mở Chatbot AI"
                        >
                            <img src={ROBOT_ICON_SVG_BASE64} alt="AI Chatbot Icon" className="w-8 h-8 filter invert" />
                        </button>
                    </>
                )}
            </div>

            {isAiEnabled && <AIChatbot isOpen={isChatOpen} setIsOpen={setIsChatOpen} />}
        </>
    );
};

export default FloatingActionButtons;