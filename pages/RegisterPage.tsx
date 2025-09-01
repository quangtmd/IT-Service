
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
      navigate('/'); // Changed from history.push
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Vui lòng nhập tên người dùng.');
      return;
    }
    if (!email.trim()) {
      setError('Vui lòng nhập email.');
      return;
    }

    const user = await register({ username, email, password });
    if (user) {
      navigate('/'); // Changed from history.push
    } else {
      setError('Đăng ký không thành công. Email có thể đã được sử dụng hoặc dữ liệu không hợp lệ.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgCanvas py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-bgBase p-10 rounded-xl shadow-xl border border-borderDefault">
        <div>
          <Link to="/" className="flex justify-center">
             <span className="text-3xl font-bold text-primary">{Constants.COMPANY_NAME}</span>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-textBase">
            Tạo tài khoản mới
          </h2>
          <p className="mt-2 text-center text-sm text-textMuted">
            Hoặc{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              đăng nhập nếu bạn đã có tài khoản
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-danger-bg border border-danger-border text-danger-text rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm">
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
                className="appearance-none rounded-none relative block w-full px-3 py-3 bg-white border border-borderStrong placeholder-textSubtle text-textBase rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm shadow-sm"
                placeholder="Tên người dùng"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="-mt-px">
              <label htmlFor="email-address" className="sr-only">
                Địa chỉ email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 bg-white border border-borderStrong placeholder-textSubtle text-textBase focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm shadow-sm"
                placeholder="Địa chỉ email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="-mt-px">
              <label htmlFor="password" className="sr-only">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                className="appearance-none rounded-none relative block w-full px-3 py-3 bg-white border border-borderStrong placeholder-textSubtle text-textBase focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm shadow-sm"
                placeholder="Mật khẩu (bỏ trống để demo)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="-mt-px">
              <label htmlFor="confirm-password" className="sr-only">
                Xác nhận mật khẩu
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                className="appearance-none rounded-none relative block w-full px-3 py-3 bg-white border border-borderStrong placeholder-textSubtle text-textBase rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm shadow-sm"
                placeholder="Xác nhận mật khẩu (bỏ trống để demo)"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" size="lg" isLoading={authLoading}>
              Đăng ký
            </Button>
          </div>
        </form>
        <p className="mt-4 text-center text-xs text-textSubtle">
            Lưu ý: Đây là hệ thống demo. Mật khẩu không bắt buộc để đăng ký.
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
