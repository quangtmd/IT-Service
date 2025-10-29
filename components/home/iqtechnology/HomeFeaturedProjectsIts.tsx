import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // Link is compatible with v6/v7
import Button from '../../ui/Button';
import * as Constants from '../../../constants.tsx';
import { MOCK_SERVICES } from '../../../data/mockData';
import { SiteSettings, Service } from '../../../types';

interface ProjectItemProps {
  item: Service;
  index: number;
}

const ProjectCardIts: React.FC<ProjectItemProps> = ({ item, index }) => {
    const placeholderImg = item.imageUrl || `https://picsum.photos/seed/modernService${item.id.replace(/\D/g,'') || index}/500/350`;

    return (
        <div
            className="modern-card group flex flex-col relative"
        >
            <Link to={`/service/${item.slug || item.id}`} className="block aspect-video overflow-hidden rounded-t-lg">
                <img src={placeholderImg} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </Link>
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center mb-3 text-primary">
                    <i className={`${item.icon || 'fas fa-cogs'} text-xl mr-3 opacity-80`}></i>
                </div>
                <h3 className="modern-card-title mb-3">
                     <Link to={`/service/${item.slug || item.id}`} className="line-clamp-2">{item.name}</Link>
                </h3>
                <p className="modern-card-description mb-5 line-clamp-3 flex-grow">{item.description}</p>
                <div className="mt-auto">
                    <Link
                        to={`/service/${item.slug || item.id}`}
                        className="modern-card-link self-start"
                    >
                        Chi tiết dịch vụ <i className="fas fa-arrow-right text-xs ml-1"></i>
                    </Link>
                </div>
            </div>
        </div>
    );
}


const HomeFeaturedProjectsIts: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);

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
    <section className="bg-bgCanvas">
      <div className="container mx-auto px-4">
        <div className="home-section-title-area">
            {projectsConfig.preTitle && (
              <span className="home-section-pretitle">
                {projectsConfig.sectionTitleIconUrl && <img src={projectsConfig.sectionTitleIconUrl} alt="" className="w-7 h-7 mr-2 object-contain" />}
                {projectsConfig.preTitle}
              </span>
            )}
            <h2 className="home-section-title text-4xl md:text-5xl font-extrabold">
              {projectsConfig.title || "Our Key Services"}
            </h2>
            <p className="home-section-subtitle">
              Explore our range of expert IT services designed to elevate your business.
            </p>
        </div>

        {featuredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredItems.slice(0,3).map((item, index) => ( 
                    <ProjectCardIts key={item.id} item={item} index={index} />
                ))}
            </div>
        ) : (
            <p className="text-center text-textMuted">Featured services are being updated.</p>
        )}

        {projectsConfig.buttonLink && projectsConfig.buttonText && featuredItems.length > 0 && (
            <div className="text-center mt-12">
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