import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import * as Constants from '../constants';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState(Constants.ADMIN_EMAIL);
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const { login, isAuthenticated, currentUser, isLoading: authLoading } = useAuth();
  const navigate = ReactRouterDOM.useNavigate();
  const location = ReactRouterDOM.useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  // New, more vibrant technology background image
  const backgroundImage = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  useEffect(() => {
    // This effect is the single source of truth for navigation after authentication.
    if (isAuthenticated && currentUser) {
      if (currentUser.role === 'admin' || currentUser.role === 'staff') {
        // For admin/staff, always go to the admin page.
        navigate('/admin', { replace: true });
      } else {
        // For regular customers, go back to the page they were on, or to the homepage.
        // Avoids a redirect loop if 'from' is the login page itself.
        navigate(from === '/login' ? '/' : from, { replace: true });
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
        const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định.';
        setError(errorMessage);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-cover bg-center"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      <div className="absolute inset-0 bg-black opacity-60"></div> {/* Dark overlay */}
      <div className="max-w-md w-full space-y-6 bg-white/80 backdrop-blur-md p-8 rounded-lg shadow-lg border border-gray-200 relative z-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">IQ Technology</h1>
          <h2 className="mt-4 text-center text-3xl font-bold text-textBase">
            Đăng nhập tài khoản
          </h2>
          <p className="mt-2 text-center text-sm text-primary">
            Hoặc{' '}
            <ReactRouterDOM.Link to="/register" className="font-medium hover:text-primary-dark">
              đăng ký nếu bạn chưa có tài khoản
            </ReactRouterDOM.Link>
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
                className="appearance-none relative block w-full px-4 py-3 bg-white border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
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
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
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
        
        <div className="relative flex justify-center text-xs uppercase my-6">
            <span className="bg-white/80 backdrop-blur-md px-2 text-gray-500">Hoặc</span>
        </div>

        <div className="space-y-3">
            <Button variant="outline" className="w-full flex items-center justify-center gap-3 !py-3 !text-base border-blue-500 text-blue-700 hover:bg-blue-50">
                <i className="fab fa-google text-lg"></i>
                <span>Đăng nhập bằng Google</span>
            </Button>
            <Button variant="outline" className="w-full flex items-center justify-center gap-3 !py-3 !text-base border-blue-800 text-blue-800 hover:bg-blue-50">
                <i className="fab fa-facebook-f text-lg"></i>
                <span>Đăng nhập bằng Facebook</span>
            </Button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
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
