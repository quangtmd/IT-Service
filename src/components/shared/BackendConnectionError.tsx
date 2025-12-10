
import React from 'react';
import Button from '@/components/ui/Button';

interface BackendConnectionErrorProps {
  error?: string | null;
}

const BackendConnectionError: React.FC<BackendConnectionErrorProps> = ({ error }) => {
  const is404Error = error && error.includes('404');

  const render404Guide = () => (
    <div className="bg-orange-50 border-orange-200 text-orange-800 p-4 rounded-md mb-4 text-sm shadow-inner">
      <p className="font-bold mb-2 text-base text-orange-900"><i className="fas fa-link-slash mr-2"></i>Chẩn đoán: Lỗi Giao Tiếp Frontend-Backend (404 Not Found)</p>
      <p>Frontend đã gửi yêu cầu nhưng Backend không tìm thấy địa chỉ API. Điều này gần như chắc chắn là do biến môi trường <code>VITE_BACKEND_API_BASE_URL</code> trên dịch vụ <strong>frontend (Static Site)</strong> của bạn bị sai, thiếu, hoặc backend chưa được deploy xong.</p>
    </div>
  );
  
  const renderGeneralGuide = () => (
     <div className="bg-white p-4 rounded-md border border-red-200 text-sm text-gray-700">
      <h4 className="font-semibold text-gray-800 mb-2">Các bước kiểm tra và khắc phục:</h4>
      <ol className="list-decimal list-inside space-y-3">
        <li className="font-bold text-red-800 bg-red-50 p-3 rounded-md border border-red-100">
          <span className="block text-base">Bước 1: Kiểm tra Logs của Backend</span>
          <span className="font-normal">Vào dịch vụ backend trên Render, chọn mục <strong>Logs</strong> và tìm thông báo lỗi.</span>
        </li>
      </ol>
    </div>
  );

  return (
    <div className="py-10 px-4 bg-red-50 text-red-800 rounded-lg border border-red-200 my-4 max-w-4xl mx-auto shadow-md">
      <div className="flex items-start gap-4">
        <i className="fas fa-server text-4xl text-red-400 mt-1"></i>
        <div>
          <h3 className="text-xl font-bold text-red-900 mb-2">{is404Error ? "Lỗi Giao Tiếp Frontend-Backend (404)" : "Lỗi Kết Nối Đến Máy Chủ (Backend)"}</h3>
          <p className="text-sm text-red-700 mb-4">
            {error || "Đã xảy ra lỗi không xác định."}
          </p>
          
          {is404Error ? render404Guide() : renderGeneralGuide()}

          <Button 
            variant="outline" 
            className="border-red-300 text-red-700 hover:bg-red-100 mt-6"
            onClick={() => window.location.reload()}
          >
            <i className="fas fa-sync-alt mr-2"></i> Thử Lại
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BackendConnectionError;
