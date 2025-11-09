import React from 'react';
import Button from '../ui/Button';

interface BackendConnectionErrorProps {
  error?: string | null;
}

const BackendConnectionError: React.FC<BackendConnectionErrorProps> = ({ error }) => {

  const renderGuide = () => (
     <div className="bg-white p-4 rounded-md border border-red-200 text-sm text-gray-700">
      <h4 className="font-semibold text-gray-800 mb-2">Các bước kiểm tra và khắc phục:</h4>
      <ol className="list-decimal list-inside space-y-3">
        <li className="font-bold text-red-800 bg-red-50 p-3 rounded-md border border-red-100">
          <span className="block text-base">Bước 1: Kiểm tra Logs của Backend trên Render</span>
          <span className="font-normal">Đây là bước quan trọng nhất. Dịch vụ backend của bạn có thể đã gặp sự cố và không khởi động được. Hãy vào dịch vụ Web Service của bạn trên Render, chọn mục <strong>Logs</strong> và tìm các thông báo lỗi màu đỏ ở cuối.</span>
        </li>
        <li>
          Nếu log báo lỗi <code className="text-red-600">ETIMEDOUT</code>, <code className="text-red-600">ENOTFOUND</code>, hoặc lỗi kết nối database:
           <ul className="list-disc list-inside ml-5 mt-1 text-xs bg-gray-50 p-2 rounded">
             <li>Đây là lỗi do IP của backend bị chặn. Vào service backend trên Render, tìm "Static Outbound IP Address" trong tab "Settings".</li>
             <li>Vào nhà cung cấp database (vd: Hostinger), tìm mục "Remote MySQL" và thêm địa chỉ IP của Render vào danh sách cho phép (whitelist).</li>
           </ul>
        </li>
        <li>
          Nếu log báo lỗi <code className="text-red-600">ER_ACCESS_DENIED_ERROR</code> (sai user/pass) hoặc <code className="text-red-600">ER_BAD_DB_ERROR</code> (sai tên DB):
          <p className="text-xs ml-5 mt-1">Kiểm tra lại các biến môi trường <code>DB_USER</code>, <code>DB_PASSWORD</code>, <code>DB_NAME</code>, <code>DB_HOST</code> trong tab "Environment" của service backend.</p>
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
          <h3 className="text-xl font-bold text-red-900 mb-2">Lỗi Kết Nối Đến Máy Chủ (Backend)</h3>
          <p className="text-sm text-red-700 mb-4">
            Ứng dụng không thể nhận dữ liệu từ server. Điều này thường xảy ra khi dịch vụ backend trên Render không thể khởi động, phần lớn là do sự cố kết nối tới cơ sở dữ liệu hoặc lỗi mã nguồn.
          </p>
          <p className="text-xs mb-4 text-red-600"><strong>Chi tiết lỗi:</strong> {error || 'Không có thông tin chi tiết.'}</p>
          
          {renderGuide()}

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