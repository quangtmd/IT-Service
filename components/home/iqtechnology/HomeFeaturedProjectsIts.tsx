
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../ui/Button';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants';
import { MOCK_SERVICES } from '../../../data/mockData';
import { SiteSettings, Service } from '../../../types';
import { Canvas } from '@react-three/fiber';
import FeaturedServicesScene from '../three/FeaturedServicesScene';
import TiltCard from '../../ui/TiltCard';

interface ProjectItemProps {
  item: Service;
  index: number;
}

const ProjectCardIts: React.FC<ProjectItemProps> = ({ item, index }) => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
    const placeholderImg = item.imageUrl || `https://picsum.photos/seed/modernService${item.id.replace(/\D/g,'') || index}/500/350`;

    return (
        <div
            ref={ref}
            className={`animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''} h-full`}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <TiltCard className="h-full">
                <div className="group flex flex-col relative h-full overflow-hidden rounded-2xl border-2 transition-all duration-300
                    bg-slate-800/40 backdrop-blur-lg shadow-2xl border-white/10 hover:border-primary hover:shadow-primary/20">
                    
                    <Link to={`/service/${item.slug || item.id}`} className="block aspect-video overflow-hidden">
                        <img src={placeholderImg} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </Link>

                    <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center mb-3 text-primary">
                            <i className={`${item.icon || 'fas fa-cogs'} text-xl mr-3 opacity-80`}></i>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                             <Link to={`/service/${item.slug || item.id}`} className="line-clamp-2">{item.name}</Link>
                        </h3>
                        <p className="text-gray-300 text-sm mb-5 line-clamp-3 flex-grow">{item.description}</p>
                        <div className="mt-auto">
                            <Link to={`/service/${item.slug || item.id}`} className="font-semibold text-primary hover:text-primary-light transition-colors">
                                Chi tiết dịch vụ <i className="fas fa-arrow-right text-xs ml-1 transition-transform group-hover:translate-x-1"></i>
                            </Link>
                        </div>
                    </div>
                </div>
            </TiltCard>
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
    <section className="home-section relative bg-[#0f172a] text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas>
          <Suspense fallback={null}>
            <FeaturedServicesScene />
          </Suspense>
        </Canvas>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div ref={titleRef} className={`home-section-title-area animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
            {projectsConfig.preTitle && (
              <span className="home-section-pretitle bg-black/40 backdrop-blur-md border border-primary/30 text-primary">
                {projectsConfig.sectionTitleIconUrl && <img src={projectsConfig.sectionTitleIconUrl} alt="" className="w-7 h-7 mr-2 object-contain" />}
                {projectsConfig.preTitle}
              </span>
            )}
            <h2 className="home-section-title text-4xl md:text-5xl font-extrabold text-white">
              {projectsConfig.title || "Các Dịch Vụ Chính Của Chúng Tôi"}
            </h2>
            <p className="home-section-subtitle text-gray-300">
              Khám phá loạt dịch vụ CNTT chuyên nghiệp của chúng tôi được thiết kế để nâng tầm doanh nghiệp của bạn.
            </p>
        </div>

        {featuredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredItems.slice(0,3).map((item, index) => ( 
                    <ProjectCardIts key={item.id} item={item} index={index} />
                ))}
            </div>
        ) : (
            <p className="text-center text-textMuted">Các dịch vụ nổi bật đang được cập nhật.</p>
        )}

        {projectsConfig.buttonLink && projectsConfig.buttonText && featuredItems.length > 0 && (
            <div className={`text-center mt-12 animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`} style={{animationDelay: '0.3s'}}>
                <Link to={projectsConfig.buttonLink}>
                <Button variant="primary" size="lg" className="px-10 py-3.5 text-base shadow-lg hover:shadow-primary/40">
                    {projectsConfig.buttonText} <i className="fas fa-arrow-right ml-2 text-sm"></i>
                </Button>
                </Link>
            </div>
        )}
      </div>
    </section>
  );
};

export default HomeFeaturedProjectsIts;
