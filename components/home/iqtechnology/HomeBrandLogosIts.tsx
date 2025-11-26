
import React, { useState, useEffect, useCallback } from 'react';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants.tsx';
import { SiteSettings } from '../../../types';
import SpotlightCard from '../../ui/SpotlightCard';

const ARSENAL_ICONS: Record<string, string> = {
    'React': 'fab fa-react',
    'JS': 'fab fa-js', 'JavaScript': 'fab fa-js',
    'Node': 'fab fa-node', 'Node.js': 'fab fa-node',
    'AWS': 'fab fa-aws',
    'Docker': 'fab fa-docker',
    'Python': 'fab fa-python',
    'Java': 'fab fa-java',
    'HTML': 'fab fa-html5',
    'CSS': 'fab fa-css3-alt',
    'Linux': 'fab fa-linux',
    'Database': 'fas fa-database',
    'Security': 'fas fa-shield-alt',
    'Cloud': 'fas fa-cloud',
    'AI': 'fas fa-brain',
};

const COLORS = ['text-cyan-400', 'text-purple-400', 'text-blue-400', 'text-green-400', 'text-orange-400', 'text-yellow-400', 'text-pink-400', 'text-red-400'];

const HomeBrandLogosIts: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  
  const brandLogosConfig = settings.homepageBrandLogos;

  const loadSettings = useCallback(() => {
    const storedSettingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
    if (storedSettingsRaw) {
      setSettings(JSON.parse(storedSettingsRaw));
    }
  }, []);

  useEffect(() => {
    loadSettings();
    window.addEventListener('siteSettingsUpdated', loadSettings);
    return () => window.removeEventListener('siteSettingsUpdated', loadSettings);
  }, [loadSettings]);

  if (!brandLogosConfig.enabled) return null;
  
  // Transform generic logos into "Tech Arsenal" items for the visual style
  const arsenalItems = (brandLogosConfig.logos || []).map((logo, index) => {
      // Heuristic to find an icon based on name
      let icon = 'fas fa-microchip'; // Default
      const nameLower = logo.name.toLowerCase();
      for (const key in ARSENAL_ICONS) {
          if (nameLower.includes(key.toLowerCase())) {
              icon = ARSENAL_ICONS[key];
              break;
          }
      }
      
      // Mock percentage for visual effect if not present
      const percentage = 70 + (index * 11 % 30); 
      const color = COLORS[index % COLORS.length];

      return { ...logo, icon, percentage, color };
  }).sort((a,b) => (a.order || 0) - (b.order || 0));

  if (arsenalItems.length === 0) return null;

  return (
    <section ref={ref} className={`py-24 bg-[#020617] text-white relative overflow-hidden animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''}`}>
       {/* Diagonal Grid Lines */}
       <div className="absolute inset-0 bg-[linear-gradient(45deg,#1f2937_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-bold tracking-widest uppercase mb-4">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                {brandLogosConfig.preTitle || "NỀN TẢNG KỸ THUẬT"}
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 font-sans">
                {brandLogosConfig.title || "KHO VŨ KHÍ CÔNG NGHỆ"}
            </h2>
             <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Làm chủ các công nghệ tiên tiến nhất.
            </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {arsenalItems.map((item, index) => (
            <SpotlightCard 
                key={item.id || index} 
                className="!p-6 flex flex-col items-center justify-center gap-4 group hover:bg-gray-800/80 transition-colors border border-white/5 bg-white/5"
                style={{ animationDelay: `${index * 50}ms` }} 
            >
                {/* Icon or Image */}
                <div className={`text-4xl ${item.color} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 filter drop-shadow-lg`}>
                    {item.logoUrl ? (
                        <img src={item.logoUrl} alt={item.name} className="h-10 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all" />
                    ) : (
                        <i className={item.icon}></i>
                    )}
                </div>
                
                <div className="text-center w-full">
                    <h4 className="font-bold text-gray-200 text-lg tracking-wide mb-3">{item.name}</h4>
                    
                    {/* Progress Bar Effect */}
                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-gray-800"></div>
                        <div 
                            className={`h-full rounded-full bg-gradient-to-r from-transparent to-current ${item.color.replace('text-', 'bg-')}`} 
                            style={{ width: `${item.percentage}%` }}
                        ></div>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-2 block font-mono uppercase tracking-widest">{item.percentage}% THÀNH THẠO</span>
                </div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeBrandLogosIts;
