import React, { useState, useEffect } from 'react';
// Fix: Use named imports for react-router-dom components and hooks
import { Link, useNavigate } from 'react-router-dom';
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
  // Fix: Use useNavigate directly
  const navigate = useNavigate();

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

  const inputStyles = "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm";

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1531297484001-80022131c5a1?q=80&w=2020&auto=format&fit=crop')" }}
    >
      <div className="max-w-md w-full space-y-8 bg-black/40 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-white/20">
        <div>
          <h2 className="text-center text-3xl font-bold text-white">
            Tạo tài khoản mới
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Tham gia cùng chúng tôi ngay hôm nay!
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-danger-bg/80 border border-danger-border text-danger-text rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">Tên người dùng</label>
              <input
                id="username" name="username" type="text" autoComplete="username" required
                className={inputStyles} placeholder="Tên người dùng *"
                value={username} onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Địa chỉ email</label>
              <input
                id="email-address" name="email" type="email" autoComplete="email" required
                className={inputStyles} placeholder="Địa chỉ email *"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Mật khẩu</label>
              <input
                id="password" name="password" type="password" autoComplete="new-password" required
                className={inputStyles} placeholder="Mật khẩu *"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">Xác nhận mật khẩu</label>
              <input
                id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" required
                className={inputStyles} placeholder="Xác nhận mật khẩu *"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full !py-3 !text-base rounded-lg" size="lg" isLoading={authLoading}>
              Đăng ký
            </Button>
          </div>
        </form>
         <p className="text-center text-sm text-gray-300">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary-light">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;