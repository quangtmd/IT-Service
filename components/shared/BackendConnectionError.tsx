import React from 'react';
import Button from '../ui/Button';

const BackendConnectionError: React.FC = () => {
  return (
    <div className="py-10 px-4 bg-red-50 text-red-800 rounded-lg border border-red-200 my-4 max-w-4xl mx-auto shadow-md">
      <div className="flex items-start gap-4">
        <i className="fas fa-server text-4xl text-red-400 mt-1"></i>
        <div>
          <h3 className="text-xl font-bold text-red-900 mb-2">Lỗi Kết Nối Đến Máy Chủ (Backend)</h3>
          <p className="text-sm text-red-700 mb-4">
            Ứng dụng không thể nhận dữ liệu từ server. Điều này thường xảy ra khi dịch vụ backend trên Render không thể khởi động, phần lớn là do sự cố kết nối tới cơ sở dữ liệu.
          </p>
          
          <div className="bg-white p-4 rounded-md border border-red-200 text-sm text-gray-700">
            <h4 className="font-semibold text-gray-800 mb-2">Các bước kiểm tra và khắc phục:</h4>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Truy cập vào <a href="https://dashboard.render.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">Render Dashboard</a> của bạn.
              </li>
              <li>
                Tìm đến service có tên là <strong>it-service-backend</strong> và vào mục <strong>Logs</strong>.
              </li>
              <li>
                Kiểm tra xem có thông báo lỗi chi tiết nào không. Các lỗi phổ biến bao gồm:
                <ul className="list-disc list-inside ml-5 mt-1 text-xs bg-gray-50 p-2 rounded">
                  <li><code className="text-red-600">ER_ACCESS_DENIED_ERROR</code>: Sai tên người dùng hoặc mật khẩu database. Hãy kiểm tra lại các biến môi trường <code className="bg-gray-200 px-1 rounded">DB_USER</code>, <code className="bg-gray-200 px-1 rounded">DB_PASSWORD</code>.</li>
                  <li><code className="text-red-600">ER_BAD_DB_ERROR</code>: Sai tên database. Kiểm tra lại biến <code className="bg-gray-200 px-1 rounded">DB_NAME</code>.</li>
                  <li className="font-bold"><code className="text-red-600">ETIMEDOUT</code> hoặc <code className="text-red-600">ENOTFOUND</code>: Không thể kết nối. Nguyên nhân lớn nhất là do <strong>IP của Render bị chặn</strong>. Hãy vào Hostinger (hoặc nhà cung cấp DB), tìm mục "Remote MySQL" và thêm IP của Render vào.</li>
                </ul>
              </li>
              <li>
                  Để xem địa chỉ IP của Render, vào service backend, chọn tab "Networking" và tìm "Static Outbound IP Address". Xem thêm tại <a href="https://render.com/docs/static-outbound-ip-addresses" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">tài liệu của Render</a>.
              </li>
               <li>
                Sau khi sửa, hãy vào service backend và chọn <strong>Manual Deploy</strong> > <strong>"Deploy latest commit"</strong> để triển khai lại.
              </li>
            </ol>
          </div>

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
