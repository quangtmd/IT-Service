import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Vui lòng điền đầy đủ các trường.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (!agreed) {
      setError('Bạn phải đồng ý với điều khoản dịch vụ.');
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
  
  const handleSocialLogin = (provider: string) => {
    console.log(`Attempting to sign up with ${provider}...`);
    setError(`Chức năng đăng ký bằng ${provider} đang được phát triển.`);
  };

  return (
    <div className="auth-container" style={{backgroundImage: "url('https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1974&auto=format&fit=crop')"}}>
      <div className="auth-card">
        {/* Info Panel */}
        <div className="auth-panel items-center text-center hidden md:flex">
          <div>
             <h2 className="text-2xl font-bold mb-4">IQ Technology</h2>
            <h1 className="auth-title">Chào Mừng Trở Lại!</h1>
            <p className="mb-8 text-white/80">Để giữ kết nối với chúng tôi, vui lòng đăng nhập bằng thông tin cá nhân của bạn</p>
            <Link to="/login">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
                    Đăng Nhập
                </Button>
            </Link>
             <div className="auth-social-login mt-12">
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
          </div>
        </div>

        {/* Form Panel */}
        <div className="auth-panel form-panel">
          <form onSubmit={handleSubmit} className="w-full">
            <h1 className="auth-title">Tạo Tài Khoản</h1>
            {error && (
                <div className="p-3 mb-4 bg-red-500/20 border border-red-500/30 text-white rounded-md text-sm">
                  {error}
                </div>
            )}
            <input
              type="text"
              placeholder="Tên người dùng"
              className="auth-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
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
            <div className="flex items-center my-4">
               <label className="auth-checkbox flex items-center">
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mr-2 h-4 w-4 accent-primary"/>
                    Tôi đồng ý với tất cả các điều khoản trong <a href="#" className="ml-1">Điều khoản dịch vụ</a>
                </label>
            </div>
            <Button type="submit" className="w-full !py-3 !text-base" variant="primary" size="lg" isLoading={authLoading}>
              Đăng Ký
            </Button>
            
            <div className="md:hidden">
              <div className="auth-social-login">
              <p className="auth-social-text">Hoặc đăng ký với</p>
              <div className="auth-social-icons">
                <button type="button" onClick={() => handleSocialLogin('Facebook')} className="auth-social-icon" aria-label="Đăng ký với Facebook">
                  <i className="fab fa-facebook-f"></i>
                </button>
                <button type="button" onClick={() => handleSocialLogin('Google')} className="auth-social-icon" aria-label="Đăng ký với Google">
                  <i className="fab fa-google"></i>
                </button>
                <button type="button" onClick={() => handleSocialLogin('GitHub')} className="auth-social-icon" aria-label="Đăng ký với GitHub">
                  <i className="fab fa-github"></i>
                </button>
              </div>
            </div>
              <p className="text-center text-sm text-white/80 mt-6">
                Bạn đã có tài khoản?{' '}
                <Link to="/login" className="font-medium text-white hover:underline">
                  Đăng Nhập
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
