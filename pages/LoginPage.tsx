import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, isAuthenticated, currentUser, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/home";

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      navigate(currentUser.role === 'admin' || currentUser.role === 'staff' ? '/admin' : (from === '/login' ? '/home' : from), { replace: true });
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
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định.';
      setError(errorMessage);
    }
  };
  
  const handleSocialLogin = (provider: string) => {
    console.log(`Attempting to sign in with ${provider}...`);
    setError(`Chức năng đăng nhập bằng ${provider} đang được phát triển.`);
  };

  return (
    <div className="auth-container" style={{backgroundImage: "url('https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1974&auto=format&fit=crop')"}}>
      <div className="auth-card">
        {/* Form Panel */}
        <div className="auth-panel form-panel">
          <form onSubmit={handleSubmit} className="w-full">
            <h1 className="auth-title">Đăng Nhập</h1>
            {error && (
                <div className="p-3 mb-4 bg-red-500/20 border border-red-500/30 text-white rounded-md text-sm">
                  {error}
                </div>
            )}
            <input
              type="email"
              placeholder="Email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
             <div className="flex justify-between items-center mb-6">
                <label className="auth-checkbox flex items-center">
                    <input type="checkbox" className="mr-2 h-4 w-4 accent-primary"/>
                    Ghi nhớ tôi
                </label>
                <a href="#" className="text-sm text-white/80 hover:text-white hover:underline">Quên mật khẩu?</a>
            </div>

            <Button type="submit" className="w-full !py-3 !text-base" variant="primary" size="lg" isLoading={authLoading}>
              Đăng Nhập
            </Button>

            <div className="auth-social-login">
              <p className="auth-social-text">Hoặc đăng nhập với</p>
              <div className="auth-social-icons">
                <button type="button" onClick={() => handleSocialLogin('Facebook')} className="auth-social-icon" aria-label="Đăng nhập với Facebook">
                  <i className="fab fa-facebook-f"></i>
                </button>
                <button type="button" onClick={() => handleSocialLogin('Google')} className="auth-social-icon" aria-label="Đăng nhập với Google">
                  <i className="fab fa-google"></i>
                </button>
                <button type="button" onClick={() => handleSocialLogin('GitHub')} className="auth-social-icon" aria-label="Đăng nhập với GitHub">
                  <i className="fab fa-github"></i>
                </button>
              </div>
            </div>
          </form>
        </div>
        
        {/* Info Panel */}
        <div className="auth-panel items-center text-center hidden md:flex">
          <div>
            <h1 className="auth-title">Xin Chào!</h1>
            <p className="mb-8 text-white/80">Nhập thông tin cá nhân của bạn và bắt đầu hành trình với chúng tôi</p>
            <Link to="/register">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
                    Đăng Ký
                </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;