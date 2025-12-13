
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import Auth3DBackground from '../components/auth/Auth3DBackground';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, isAuthenticated, currentUser, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.role === 'admin' || currentUser.role === 'staff') {
        navigate('/admin', { replace: true });
      } else {
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
    } catch (err) {
        console.error("Login page caught error:", err);
        const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định.';
        setError(errorMessage);
    }
  };

  // Glassmorphism input style
  const inputStyles = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:bg-white/10 transition-all duration-300 backdrop-blur-sm";

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* 3D Background */}
      <Auth3DBackground />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4 sm:px-6 lg:px-8 animate-fade-in-up">
        <div className="bg-black/20 backdrop-blur-xl p-8 sm:p-10 rounded-2xl shadow-[0_0_40px_rgba(0,243,255,0.1)] border border-white/20">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/30">
                <i className="fas fa-user text-2xl text-white"></i>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Chào Mừng Trở Lại
            </h2>
            <p className="mt-2 text-sm text-cyan-200/70">
              Đăng nhập để truy cập hệ thống IQ Technology
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-200 rounded-lg text-sm flex items-center animate-shake">
              <i className="fas fa-exclamation-circle mr-2 text-red-400"></i> {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-1">Email</label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-envelope text-gray-500"></i>
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`${inputStyles} pl-10`}
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-1">Mật khẩu</label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-lock text-gray-500"></i>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className={`${inputStyles} pl-10`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 bg-white/10 border-gray-500 text-cyan-500 focus:ring-cyan-500 rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-gray-300">Ghi nhớ tôi</label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors">Quên mật khẩu?</a>
              </div>
            </div>
            
            <div>
              <Button 
                type="submit" 
                className="w-full !py-3.5 !text-base rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border-none transition-all duration-300 transform hover:-translate-y-0.5" 
                size="lg" 
                isLoading={authLoading}
              >
                ĐĂNG NHẬP
              </Button>
            </div>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
