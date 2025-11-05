import React from 'react';
import Button from '../ui/Button';

interface BackendConnectionErrorProps {
  error?: string | null;
}

const BackendConnectionError: React.FC<BackendConnectionErrorProps> = ({ error }) => {
  const is404Error = error && error.includes('404');

  const render404Guide = () => (
    <div className="bg-orange-50 border-orange-200 text-orange-800 p-4 rounded-md mb-4 text-sm shadow-inner">
      <p className="font-bold mb-2 text-base text-orange-900"><i className="fas fa-link-slash mr-2"></i>Chẩn đoán: Lỗi Giao Tiếp Frontend-Backend (404 Not Found)</p>
      <p>Frontend đã gửi yêu cầu nhưng Backend không tìm thấy địa chỉ API. Điều này gần như chắc chắn là do biến môi trường <code>VITE_BACKEND_API_BASE_URL</code> trên dịch vụ <strong>frontend (Static Site)</strong> của bạn bị sai hoặc thiếu.</p>
      <div className="mt-3 bg-white p-3 rounded border border-orange-200">
        <p className="font-semibold">Hành động khắc phục:</p>
        <ol className="list-decimal list-inside space-y-1 mt-1">
          <li>Vào dịch vụ <strong>frontend</strong> (tên là <code>it-service-frontend</code>) trên Render.</li>
          <li>Chọn tab <strong>"Environment"</strong>.</li>
          <li>Kiểm tra lại biến <code>VITE_BACKEND_API_BASE_URL</code> và đảm bảo nó là URL chính xác của dịch vụ backend.</li>
          <li>Sau khi sửa, hãy chọn <strong>"Manual Deploy"</strong> &gt; <strong>"Deploy latest commit"</strong> cho dịch vụ frontend.</li>
        </ol>
      </div>
    </div>
  );
  
  const renderGeneralGuide = () => (
     <div className="bg-white p-4 rounded-md border border-red-200 text-sm text-gray-700">
      <h4 className="font-semibold text-gray-800 mb-2">Các bước kiểm tra và khắc phục:</h4>
      <ol className="list-decimal list-inside space-y-3">
        <li className="font-bold text-red-800 bg-red-50 p-3 rounded-md border border-red-100">
          <span className="block text-base">Bước 1: Kiểm tra Logs của Backend</span>
          <span className="font-normal">Đây là bước quan trọng nhất. Vào dịch vụ có tên <strong>it-service-backend</strong> trên Render, chọn mục <strong>Logs</strong> và tìm thông báo lỗi màu đỏ. Log sẽ cho bạn biết chính xác nguyên nhân (sai mật khẩu, IP bị chặn, v.v.).</span>
        </li>
        <li>
          Nếu log báo lỗi <code className="text-red-600">ETIMEDOUT</code> hoặc <code className="text-red-600">ENOTFOUND</code> (IP bị chặn):
           <ul className="list-disc list-inside ml-5 mt-1 text-xs bg-gray-50 p-2 rounded">
             <li>Vào service backend trên Render, chọn tab "Networking" và tìm "Static Outbound IP Address".</li>
             <li>Vào Hostinger (hoặc nhà cung cấp DB), tìm mục "Remote MySQL" và thêm địa chỉ IP của Render vào. Xem thêm tại <a href="https://render.com/docs/static-outbound-ip-addresses" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">tài liệu của Render</a>.</li>
           </ul>
        </li>
        <li>
          Nếu log báo lỗi <code className="text-red-600">ER_ACCESS_DENIED_ERROR</code> hoặc <code className="text-red-600">ER_BAD_DB_ERROR</code>:
          <p className="text-xs ml-5 mt-1">Kiểm tra lại các biến môi trường <code>DB_USER</code>, <code>DB_PASSWORD</code>, <code>DB_NAME</code> trong tab "Environment" của service backend.</p>
        </li>
         <li>
          Sau khi sửa, hãy vào service backend và chọn <strong>Manual Deploy</strong> &gt; <strong>"Deploy latest commit"</strong> để triển khai lại.
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
            {is404Error 
              ? "Ứng dụng không thể tìm thấy API endpoint được yêu cầu." 
              : "Ứng dụng không thể nhận dữ liệu từ server. Điều này thường xảy ra khi dịch vụ backend trên Render không thể khởi động, phần lớn là do sự cố kết nối tới cơ sở dữ liệu."
            }
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