import React from 'react';
import Button from '../ui/Button';

const BackendConnectionError: React.FC = () => {
  return (
    <div className="text-center py-10 px-4 bg-red-50 text-red-800 rounded-lg border border-red-200 my-4 max-w-3xl mx-auto">
      <i className="fas fa-server text-5xl text-red-400 mb-4"></i>
      <h3 className="text-xl font-bold text-red-900 mb-2">Lỗi Kết Nối Server</h3>
      <p className="text-sm mb-4">
        Không thể kết nối đến máy chủ backend. Dữ liệu đang hiển thị có thể là dữ liệu mặc định hoặc đã được lưu trữ tạm thời. Vui lòng kiểm tra lại kết nối mạng của bạn và thử lại.
      </p>
      <Button 
        variant="outline" 
        className="border-red-300 text-red-700 hover:bg-red-100"
        onClick={() => window.location.reload()}
      >
        <i className="fas fa-sync-alt mr-2"></i> Tải lại trang
      </Button>
    </div>
  );
};

export default BackendConnectionError;
