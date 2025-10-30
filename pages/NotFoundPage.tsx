


import React from 'react';
// FIX: Using wildcard import for react-router-dom to handle potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 text-center flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <svg className="w-32 h-32 text-primary mb-8" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 22c-5.514 0-10-4.486-10-10s4.486-10 10-10 10 4.486 10 10-4.486 10-10 10zm-1-17h2v10h-2zm0 12h2v2h-2z"/>
      </svg>
      <h1 className="text-5xl font-bold text-textBase mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-textMuted mb-6">Trang không tồn tại</h2>
      <p className="text-textSubtle mb-8 max-w-md">
        Rất tiếc, chúng tôi không thể tìm thấy trang bạn yêu cầu. Có thể trang đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
      </p>
      <ReactRouterDOM.Link to="/home">
        <Button size="lg" variant="primary">
          <i className="fas fa-home mr-2"></i> Về Trang Chủ
        </Button>
      </ReactRouterDOM.Link>
    </div>
  );
};

export default NotFoundPage;