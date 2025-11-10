import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom'; // Updated imports for v6/v7
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import * as Constants from '../constants.tsx';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = ReactRouterDOM.useNavigate(); // Changed from useHistory

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/'); // Changed from history.push
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
      }
      
      if (!/\S+@\S+\.\S+/.test(email)) {
          setError('Địa chỉ email không hợp lệ.');
          return;
      }

    try {
        const user = await register({ username, email, password });
        if (user) {
          navigate('/');
        } else {
          setError('Đăng ký không thành công. Vui lòng thử lại.');
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.';
        setError(errorMessage);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-200"
    >
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-primary text-center">IQ Technology</h1>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-800">
            Tạo tài khoản mới
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hoặc{' '}
            <ReactRouterDOM.Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              đăng nhập nếu bạn đã có tài khoản
            </ReactRouterDOM.Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-danger-bg border border-danger-border text-danger-text rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Tên người dùng
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 bg-white border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Tên người dùng *"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">
                Địa chỉ email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 bg-white border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Địa chỉ email *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 bg-white border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Mật khẩu *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Xác nhận mật khẩu
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 bg-white border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Xác nhận mật khẩu *"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full !py-3 !text-base rounded-lg" size="lg" isLoading={authLoading}>
              Đăng ký
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;