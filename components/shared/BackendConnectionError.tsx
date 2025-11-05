import React from 'react';
import Button from '../ui/Button';

const BackendConnectionError: React.FC = () => {
    return (
        <div className="text-left my-8 w-full flex-grow text-red-700 bg-red-50 p-6 rounded-lg border border-red-200 max-w-4xl mx-auto">
            <h3 className="font-bold text-lg mb-2"><i className="fas fa-server mr-2"></i> Lỗi kết nối đến máy chủ (Backend)</h3>
            <p className="mb-4 text-sm">Ứng dụng không thể nhận dữ liệu từ server. Điều này thường xảy ra khi dịch vụ backend trên Render không thể khởi động, phần lớn là do sự cố kết nối tới cơ sở dữ liệu.</p>
            <h4 className="font-semibold mb-2">Các bước kiểm tra và khắc phục:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Truy cập vào <a href="https://dashboard.render.com/" target="_blank" rel="noopener noreferrer" className="underline font-medium">Render Dashboard</a> của bạn.</li>
                <li>Tìm đến service có tên là <strong>it-service-backend</strong> và vào mục <strong>Logs</strong>.</li>
                <li>Kiểm tra xem có lỗi <code className="bg-red-100 p-1 rounded text-xs">❌ LỖI KẾT NỐI DATABASE</code> hay không.</li>
                <li>Nếu có lỗi trên, hãy vào mục <strong>Environment</strong> của service backend và:
                    <ul className="list-disc list-inside ml-6 mt-1">
                        <li>Kiểm tra kỹ các biến môi trường: <code className="text-xs">DB_HOST</code>, <code className="text-xs">DB_USER</code>, <code className="text-xs">DB_PASSWORD</code>, <code className="text-xs">DB_NAME</code> đã chính xác chưa.</li>
                        <li><strong>Quan trọng:</strong> Đảm bảo rằng nhà cung cấp database (ví dụ: Hostinger) đã cho phép (whitelisted) địa chỉ IP của Render kết nối vào. <a href="https://render.com/docs/static-outbound-ip-addresses" target="_blank" rel="noopener noreferrer" className="underline">Xem tài liệu IP của Render tại đây</a>. Đối với gói miễn phí, bạn có thể cần cho phép tất cả các IP (<code className="text-xs">0.0.0.0/0</code>).</li>
                    </ul>
                </li>
                <li>Sau khi sửa, hãy vào mục <strong>Manual Deploy</strong> của service <strong>it-service-backend</strong> và chọn <strong>"Deploy latest commit"</strong> để triển khai lại.</li>
            </ol>
            <Button onClick={() => window.location.reload()} className="mt-6">Thử lại</Button>
        </div>
    )
};

export default BackendConnectionError;
