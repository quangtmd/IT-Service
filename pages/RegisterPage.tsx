
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import Auth3DBackground from '../components/auth/Auth3DBackground';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
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

  // Glassmorphism input style
  const inputStyles = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent focus:bg-white/10 transition-all duration-300 backdrop-blur-sm";

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* 3D Background */}
      <Auth3DBackground />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4 sm:px-6 lg:px-8 animate-fade-in-up">
        <div className="bg-black/30 backdrop-blur-xl p-8 sm:p-10 rounded-2xl shadow-[0_0_40px_rgba(236,72,153,0.1)] border border-white/10">
            <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-pink-500 to-rose-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-pink-500/30">
                    <i className="fas fa-user-plus text-2xl text-white"></i>
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                    Tạo Tài Khoản Mới
                </h2>
                <p className="mt-2 text-sm text-pink-200/70">
                    Tham gia cộng đồng công nghệ cùng IQ Tech
                </p>
            </div>
        
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-200 rounded-lg text-sm flex items-center animate-shake">
                <i className="fas fa-exclamation-circle mr-2 text-red-400"></i> {error}
                </div>
            )}
            
            <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="username" className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-1">Tên người dùng</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-user text-gray-500"></i>
                    </div>
                    <input
                        id="username" name="username" type="text" autoComplete="username" required
                        className={`${inputStyles} pl-10`} placeholder="VD: nguyenvan_a"
                        value={username} onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
            </div>
            <div>
                <label htmlFor="email-address" className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-1">Email</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-envelope text-gray-500"></i>
                    </div>
                    <input
                        id="email-address" name="email" type="email" autoComplete="email" required
                        className={`${inputStyles} pl-10`} placeholder="name@example.com"
                        value={email} onChange={(e) => setEmail(e.target.value)}
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
                        id="password" name="password" type="password" autoComplete="new-password" required
                        className={`${inputStyles} pl-10`} placeholder="Ít nhất 6 ký tự"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>
            <div>
                <label htmlFor="confirm-password" className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-1">Xác nhận mật khẩu</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-check-circle text-gray-500"></i>
                    </div>
                    <input
                        id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" required
                        className={`${inputStyles} pl-10`} placeholder="Nhập lại mật khẩu"
                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
            </div>

            <div className="pt-2">
                <Button 
                    type="submit" 
                    className="w-full !py-3.5 !text-base rounded-lg shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 border-none transition-all duration-300 transform hover:-translate-y-0.5" 
                    size="lg" 
                    isLoading={authLoading}
                >
                ĐĂNG KÝ TÀI KHOẢN
                </Button>
            </div>
            </form>
            <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-bold text-pink-400 hover:text-pink-300 transition-colors hover:underline">
                Đăng nhập ngay
            </Link>
            </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
