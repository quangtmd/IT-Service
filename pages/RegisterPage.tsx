import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Updated imports for v6/v7
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
  const navigate = useNavigate(); // Changed from useHistory

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home'); // Changed from history.push
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

    try {
        const user = await register({ username, email, password });
        if (user) {
          navigate('/home');
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
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')" }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="relative max-w-md w-full space-y-6 bg-black/40 backdrop-blur-xl border border-slate-700 p-8 rounded-2xl shadow-2xl">
        <div>
          <Link to="/home" className="flex justify-center">
             <span className="text-3xl font-bold text-primary">{Constants.COMPANY_NAME}</span>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-bold text-white">
            Tạo tài khoản mới
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Hoặc{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              đăng nhập nếu bạn đã có tài khoản
            </Link>
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-danger-bg border border-danger-border text-danger-text rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
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
                className="appearance-none relative block w-full px-4 py-3 bg-white/10 border border-gray-500 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm focus:ring-offset-2 focus:ring-offset-gray-900"
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
                className="appearance-none relative block w-full px-4 py-3 bg-white/10 border border-gray-500 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm focus:ring-offset-2 focus:ring-offset-gray-900"
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
                className="appearance-none relative block w-full px-4 py-3 bg-white/10 border border-gray-500 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm focus:ring-offset-2 focus:ring-offset-gray-900"
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
                className="appearance-none relative block w-full px-4 py-3 bg-white/10 border border-gray-500 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm focus:ring-offset-2 focus:ring-offset-gray-900"
                placeholder="Xác nhận mật khẩu *"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full !py-3 !text-base" size="lg" isLoading={authLoading}>
              Đăng ký
            </Button>
          </div>
        </form>
         <div className="relative flex py-3 items-center">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-300 text-sm">Hoặc đăng ký với</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <div className="grid grid-cols-3 gap-4">
            <Button variant="outline" className="!border-gray-600 !text-white hover:!bg-white/10 !py-3">
                <i className="fab fa-google text-red-500 text-xl"></i>
            </Button>
            <Button variant="outline" className="!border-gray-600 !text-white hover:!bg-white/10 !py-3">
                <i className="fab fa-facebook-f text-blue-500 text-xl"></i>
            </Button>
            <Button variant="outline" className="!border-gray-600 !text-white hover:!bg-white/10 !py-3">
                <i className="fab fa-github text-xl"></i>
            </Button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;