
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants.tsx';
import { MOCK_SERVICES } from '../../../data/mockData';
import { SiteSettings, Service } from '../../../types';
import NeonGradientCard from '../../ui/NeonGradientCard';

interface ProjectItemProps {
  item: Service;
  index: number;
}

const ProjectCardIts: React.FC<ProjectItemProps> = ({ item, index }) => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
    const placeholderImg = item.imageUrl || `https://picsum.photos/seed/modernService${item.id.replace(/\D/g,'') || index}/500/350`;

    return (
        <div ref={ref} className={`h-full animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''}`} style={{ animationDelay: `${index * 100}ms` }}>
            <NeonGradientCard className="h-full group hover:-translate-y-2 transition-transform duration-300">
                <div className="relative h-48 overflow-hidden rounded-lg mb-5">
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent z-10"></div>
                    <img 
                        src={placeholderImg} 
                        alt={item.name} 
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out grayscale group-hover:grayscale-0" 
                    />
                    <div className="absolute bottom-3 left-3 z-20">
                         <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur border border-white/20 flex items-center justify-center text-cyan-400">
                            <i className={`${item.icon || 'fas fa-cogs'}`}></i>
                         </div>
                    </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-cyan-300 transition-colors">
                     <Link to={`/service/${item.slug || item.id}`} className="block">{item.name}</Link>
                </h3>
                
                <p className="text-gray-400 text-sm mb-5 line-clamp-3 leading-relaxed">
                    {item.description}
                </p>
                
                <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-xs font-mono text-gray-500">ID: {item.id}</span>
                    <Link
                        to={`/service/${item.slug || item.id}`}
                        className="text-sm font-bold text-cyan-500 hover:text-white transition-colors"
                    >
                        XEM CHI TIẾT &rarr;
                    </Link>
                </div>
            </NeonGradientCard>
        </div>
    );
}


const HomeFeaturedProjectsIts: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [titleRef, isTitleVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  const projectsConfig = settings.homepageFeaturedProjects;

  const loadSettings = useCallback(() => {
    const storedSettingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
    if (storedSettingsRaw) {
      setSettings(JSON.parse(storedSettingsRaw));
    } else {
      setSettings(Constants.INITIAL_SITE_SETTINGS);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    window.addEventListener('siteSettingsUpdated', loadSettings);
    return () => {
      window.removeEventListener('siteSettingsUpdated', loadSettings);
    };
  }, [loadSettings]);

  if (!projectsConfig.enabled) return null;

  const featuredItems = projectsConfig.featuredServiceIds
    .map(id => MOCK_SERVICES.find(service => service.id === id))
    .filter(Boolean) as Service[];

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4 relative z-10">
        <div ref={titleRef} className={`text-center mb-16 animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
            {projectsConfig.preTitle && (
              <span className="text-cyan-500 font-mono text-sm tracking-widest uppercase mb-2 block">
                // {projectsConfig.preTitle}
              </span>
            )}
            <h2 className="text-4xl md:text-5xl font-black text-white">
              {projectsConfig.title || "GIẢI PHÁP TIÊU BIỂU"}
            </h2>
        </div>

        {featuredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredItems.slice(0,3).map((item, index) => ( 
                    <ProjectCardIts key={item.id} item={item} index={index} />
                ))}
            </div>
        ) : (
            <p className="text-center text-gray-500">Các dịch vụ nổi bật đang được cập nhật.</p>
        )}

        {projectsConfig.buttonLink && projectsConfig.buttonText && featuredItems.length > 0 && (
            <div className={`text-center mt-16 animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`} style={{animationDelay: '0.3s'}}>
                <Link to={projectsConfig.buttonLink} className="inline-block relative px-8 py-3 font-bold text-white group">
                    <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-700"></span>
                    <span className="relative z-10 group-hover:text-cyan-400 transition-colors duration-300 uppercase tracking-wider">{projectsConfig.buttonText} +++</span>
                </Link>
            </div>
        )}
      </div>
    </section>
  );
};

export default HomeFeaturedProjectsIts;
