
import React, { useState, useEffect, useCallback } from 'react';
import { SiteSettings, LEDBoardItem } from '../../../types';
import * as Constants from '../../../constants';

const HeroLEDBoard: React.FC = () => {
  const [items, setItems] = useState<LEDBoardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Load data from site settings
  useEffect(() => {
    const loadSettings = () => {
      const storedSettingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
      const settings: SiteSettings = storedSettingsRaw ? JSON.parse(storedSettingsRaw) : Constants.INITIAL_SITE_SETTINGS;
      
      const boardSettings = settings.homepageLEDBoard || Constants.INITIAL_HOMEPAGE_LED_BOARD;
      
      if (boardSettings.enabled) {
        const activeItems = boardSettings.items
          .filter(item => item.isEnabled)
          .sort((a, b) => a.order - b.order);
        setItems(activeItems.length > 0 ? activeItems : Constants.INITIAL_LED_BOARD_ITEMS);
      } else {
        setItems([]);
      }
    };

    loadSettings();
    window.addEventListener('siteSettingsUpdated', loadSettings);
    return () => window.removeEventListener('siteSettingsUpdated', loadSettings);
  }, []);

  // Auto-slide logic with smooth transition
  useEffect(() => {
    if (items.length <= 1) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
        setIsTransitioning(false);
      }, 500); // Half of the transition time
    }, 5000); 

    return () => clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];

  return (
    <div className="relative w-full max-w-2xl transform rotate-y-12 hover:rotate-0 transition-transform duration-500 perspective-1000">
        {/* Outer Frame - Glass Effect */}
        <div className="bg-gray-900/30 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden group">
            
            {/* Neon Border Effect */}
            <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.1)_inset] z-10 pointer-events-none"></div>
            
            {/* Decorative Screws */}
            <div className="absolute top-3 left-3 w-2 h-2 bg-gray-500/50 rounded-full z-20 shadow-inner"></div>
            <div className="absolute top-3 right-3 w-2 h-2 bg-gray-500/50 rounded-full z-20 shadow-inner"></div>
            <div className="absolute bottom-3 left-3 w-2 h-2 bg-gray-500/50 rounded-full z-20 shadow-inner"></div>
            <div className="absolute bottom-3 right-3 w-2 h-2 bg-gray-500/50 rounded-full z-20 shadow-inner"></div>

            {/* Inner Screen Container */}
            <div className="bg-black/40 h-80 rounded-lg relative overflow-hidden flex flex-col font-sans border border-white/5 shadow-inner backdrop-blur-md">
                
                {/* Scanline Effect (Subtle) */}
                <div className="scanline opacity-20"></div>
                
                {/* Screen Glare/Reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-30"></div>

                {/* Header Bar */}
                <div className="bg-cyan-900/30 border-b border-cyan-500/20 p-3 flex justify-between items-center z-10 backdrop-blur-sm relative">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red]"></div>
                        <span className="text-cyan-300 text-[10px] font-bold tracking-widest uppercase drop-shadow-md">System Notice</span>
                    </div>
                    <div className="text-cyan-500/80 text-[10px] font-mono">ID: {currentItem.id.slice(-4).toUpperCase()}</div>
                </div>

                {/* Content Area */}
                <div className={`p-6 flex-grow flex flex-col justify-center items-center relative z-10 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                    
                    {/* Layout logic based on image presence */}
                    {currentItem.imageUrl ? (
                        <div className="flex items-center gap-6 w-full h-full">
                            <div className="w-1/3 h-32 relative flex-shrink-0 border border-cyan-500/30 rounded-md overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                                <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay z-10"></div> {/* Light tint */}
                                <img 
                                    src={currentItem.imageUrl} 
                                    alt={currentItem.title} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="w-2/3 text-left">
                                <h3 className="text-yellow-300 font-bold text-2xl mb-2 tracking-wide text-glow-yellow leading-tight">
                                    {currentItem.title}
                                </h3>
                                <p className="text-gray-100 text-sm md:text-base leading-relaxed mb-4 font-medium text-shadow-sm">
                                    {currentItem.content}
                                </p>
                                <div className="inline-block bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 px-3 py-1 rounded text-xs font-bold uppercase animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                                    {currentItem.highlight}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center w-full">
                            <h3 className="text-yellow-300 font-bold text-3xl md:text-4xl mb-4 tracking-wide text-glow-yellow uppercase">
                                {currentItem.title}
                            </h3>
                            <p className="text-gray-100 text-lg md:text-xl leading-relaxed mb-6 font-semibold max-w-md mx-auto text-shadow-sm">
                                {currentItem.content}
                            </p>
                            <div className="inline-block bg-red-500/20 border border-red-500/50 text-red-300 px-6 py-2 rounded-full text-sm font-bold uppercase animate-pulse text-glow-red shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                                {currentItem.highlight}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Bar (Marquee) */}
                <div className="bg-black/60 border-t border-white/10 py-2 px-4 z-10 overflow-hidden whitespace-nowrap backdrop-blur-sm relative">
                    <div className="inline-block animate-[marquee_15s_linear_infinite] text-green-400 text-xs font-mono font-semibold text-glow-green tracking-wide">
                        +++ CẬP NHẬT CÔNG NGHỆ MỚI NHẤT +++ LIÊN HỆ NGAY ĐỂ NHẬN TƯ VẤN MIỄN PHÍ +++ HOTLINE: 0911.855.055 +++ GIẢI PHÁP IT TOÀN DIỆN CHO DOANH NGHIỆP +++
                    </div>
                </div>
            </div>
        </div>
        
        {/* Glowing Reflection beneath */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-cyan-500/10 blur-xl rounded-full"></div>
    </div>
  );
};

export default HeroLEDBoard;
