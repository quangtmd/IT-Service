import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import * as Constants from '../constants';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState(Constants.ADMIN_EMAIL);
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const { login, isAuthenticated, currentUser, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/home";

  useEffect(() => {
    // This effect is the single source of truth for navigation after authentication.
    if (isAuthenticated && currentUser) {
      if (currentUser.role === 'admin' || currentUser.role === 'staff') {
        // For admin/staff, always go to the admin page.
        navigate('/admin', { replace: true });
      } else {
        // For regular customers, go back to the page they were on, or to the homepage.
        // Avoids a redirect loop if 'from' is the login page itself.
        navigate(from === '/login' ? '/home' : from, { replace: true });
      }
    }
  }, [isAuthenticated, currentUser, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    try {
        await login({ email, password });
        // On success, the useEffect hook above will handle navigation.
    } catch (err) {
        console.error("Login page caught error:", err);
        const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định.';
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
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">IQ Technology</h1>
          <h2 className="mt-4 text-center text-3xl font-bold text-white">
            Đăng nhập tài khoản
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Hoặc{' '}
            <Link to="/register" className="font-medium text-primary hover:text-primary-dark">
              đăng ký nếu bạn chưa có tài khoản
            </Link>
          </p>
        </div>
        
        {error && (
            <div className="p-4 bg-danger-bg border border-danger-border text-danger-text rounded-md text-sm">
              {error}
            </div>
        )}
        
        <form className="space-y-4" onSubmit={handleSubmit}>
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
                placeholder="Địa chỉ email"
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
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-4 py-3 bg-white/10 border border-gray-500 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm focus:ring-offset-2 focus:ring-offset-gray-900"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          
          <div className="pt-2">
            <Button type="submit" className="w-full !py-3 !text-base" size="lg" isLoading={authLoading}>
              Đăng nhập
            </Button>
          </div>
        </form>

        <div className="relative flex py-3 items-center">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-300 text-sm">Hoặc đăng nhập với</span>
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
        
        <p className="text-center text-sm text-gray-300">
            Quên mật khẩu?{' '}
            <a href="#" className="font-medium text-primary hover:text-primary-dark">
                Đặt lại mật khẩu
            </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;