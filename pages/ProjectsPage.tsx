

import React from 'react';
import { MOCK_PROJECTS } from '../data/mockData';
import Card from '../components/ui/Card';
// FIX: Using wildcard import for react-router-dom to handle potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';

const ProjectsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-textBase mb-2">Dự Án Đã Thực Hiện</h1>
        <p className="text-textMuted max-w-2xl mx-auto">
          Chúng tôi tự hào giới thiệu một số dự án tiêu biểu đã được triển khai thành công, mang lại giải pháp công nghệ tối ưu cho khách hàng.
        </p>
      </div>

      {MOCK_PROJECTS.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_PROJECTS.map(project => (
            <Card key={project.id} className="flex flex-col overflow-hidden h-full border border-borderDefault hover:shadow-xl transition-shadow duration-300">
              <img
                src={project.imageUrl || `https://picsum.photos/seed/${project.id}/400/250`}
                alt={project.title}
                className="w-full h-56 object-cover" 
              />
              <div className="p-6 flex flex-col flex-grow">
                {project.category && <p className="text-sm text-primary mb-1 font-medium">{project.category}</p>}
                <h3 className="text-xl font-semibold text-textBase mb-2 line-clamp-2" title={project.title}>
                  {project.title}
                </h3>
                {project.client && <p className="text-sm text-textMuted mb-1">Khách hàng: <span className="font-medium">{project.client}</span></p>}
                {project.completionDate && <p className="text-xs text-textSubtle mb-2">Hoàn thành: {project.completionDate}</p>}
                <p className="text-textMuted text-sm mb-4 line-clamp-4 flex-grow">{project.description}</p>
                {project.technologiesUsed && project.technologiesUsed.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-textBase mb-1">Công nghệ sử dụng:</h4>
                    <div className="flex flex-wrap gap-1">
                      {project.technologiesUsed.map(tech => (
                        <span key={tech} className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">{tech}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-textMuted text-xl">Chưa có dự án nào được cập nhật.</p>
      )}
    </div>
  );
};

export default ProjectsPage;