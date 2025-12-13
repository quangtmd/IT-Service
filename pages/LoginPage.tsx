import React, { useState, useEffect } from 'react';
// Fix: Use named imports for react-router-dom components and hooks
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, isAuthenticated, currentUser, isLoading: authLoading } = useAuth();
  // Fix: Use hooks directly
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

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
        console.error("Login page caught error:", err);
        const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định.';
        setError(errorMessage);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1531297484001-80022131c5a1?q=80&w=2020&auto=format&fit=crop')" }}
    >
      <div className="max-w-md w-full space-y-8 bg-black/40 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-white/20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">
            Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Chào mừng trở lại!
          </p>
        </div>
        
        {error && (
          <div className="p-4 bg-danger-bg/80 border border-danger-border text-danger-text rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email-address" className="sr-only">Email</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Mật khẩu</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 bg-gray-600 border-gray-500 text-primary focus:ring-primary rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-gray-300">Ghi nhớ tôi</label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-primary hover:text-primary-light">Quên mật khẩu?</a>
            </div>
          </div>
          
          <div>
            <Button type="submit" className="w-full !py-3 !text-base rounded-lg" size="lg" isLoading={authLoading}>
              Đăng nhập
            </Button>
          </div>
        </form>
        
        <p className="text-center text-sm text-gray-300">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-medium text-primary hover:text-primary-light">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;