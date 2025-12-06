
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom'; // Link is compatible with v6/v7
import { MOCK_PROJECTS } from '../../data/mockData';
import { Project } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

const FeaturedProjects: React.FC = () => {
  const featuredProjects = MOCK_PROJECTS.slice(0, 3); 

  if (featuredProjects.length === 0) {
    return null; 
  }

  return (
    <section className="py-16 bg-bgCanvas">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-textBase mb-4">Dự Án Tiêu Biểu</h2>
        <p className="text-center text-textMuted mb-12 max-w-xl mx-auto">
          Một số dự án nổi bật chúng tôi đã thực hiện, mang lại giải pháp hiệu quả cho khách hàng.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project: Project) => (
            <Card key={project.id} className="flex flex-col overflow-hidden h-full border border-borderDefault hover:shadow-xl transition-shadow duration-300">
              <ReactRouterDOM.Link to={`/projects`} className="block aspect-video overflow-hidden"> 
                <img
                  src={project.imageUrl || `https://picsum.photos/seed/${project.id}proj/400/225`}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </ReactRouterDOM.Link>
              <div className="p-6 flex flex-col flex-grow">
                {project.category && <p className="text-xs text-primary mb-1 font-semibold uppercase tracking-wide">{project.category}</p>}
                <ReactRouterDOM.Link to={`/projects`} className="block"> 
                  <h3 className="text-lg font-semibold text-textBase mb-2 hover:text-primary transition-colors line-clamp-2" title={project.title}>
                    {project.title}
                  </h3>
                </ReactRouterDOM.Link>
                <p className="text-textMuted text-sm mb-3 line-clamp-3 flex-grow">{project.description}</p>
                {project.client && <p className="text-xs text-textSubtle mb-3">Khách hàng: <span className="font-medium text-textMuted">{project.client}</span></p>}
                <div className="mt-auto">
                  <ReactRouterDOM.Link to="/projects">
                    <Button variant="outline" size="sm" className="w-full">
                      Xem Tất Cả Dự Án <i className="fas fa-arrow-right text-xs ml-2"></i>
                    </Button>
                  </ReactRouterDOM.Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
        {MOCK_PROJECTS.length > 3 && (
            <div className="text-center mt-12">
                <ReactRouterDOM.Link to="/projects">
                    <Button size="lg" variant="primary">Xem tất cả dự án</Button>
                </ReactRouterDOM.Link>
            </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProjects;