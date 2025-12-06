import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom'; // Updated imports for v6/v7
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
  const navigate = ReactRouterDOM.useNavigate(); // Changed from useHistory

  // New, more vibrant technology background image (same as login page for consistency)
  const backgroundImage = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";


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

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-cover bg-center"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      <div className="absolute inset-0 bg-black opacity-60"></div> {/* Dark overlay */}
      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-md p-10 rounded-xl shadow-xl border border-borderDefault relative z-10">
        <div>
          <ReactRouterDOM.Link to="/" className="flex justify-center">
             <span className="text-3xl font-bold text-primary">{Constants.COMPANY_NAME}</span>
          </ReactRouterDOM.Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-textBase">
            Tạo tài khoản mới
          </h2>
          <p className="mt-2 text-center text-sm text-textMuted">
            Hoặc{' '}
            <ReactRouterDOM.Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              đăng nhập nếu bạn đã có tài khoản
            </ReactRouterDOM.Link>
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
                placeholder="Tên người dùng *"
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
                placeholder="Địa chỉ email *"
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
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 bg-white border border-borderStrong placeholder-textSubtle text-textBase focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm shadow-sm"
                placeholder="Mật khẩu *"
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
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 bg-white border border-borderStrong placeholder-textSubtle text-textBase rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm shadow-sm"
                placeholder="Xác nhận mật khẩu *"
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

        <div className="relative flex justify-center text-xs uppercase my-6">
            <span className="bg-white/80 backdrop-blur-md px-2 text-gray-500">Hoặc</span>
        </div>

        <div className="space-y-3">
            <Button variant="outline" className="w-full flex items-center justify-center gap-3 !py-3 !text-base border-blue-500 text-blue-700 hover:bg-blue-50">
                <i className="fab fa-google text-lg"></i>
                <span>Đăng ký bằng Google</span>
            </Button>
            <Button variant="outline" className="w-full flex items-center justify-center gap-3 !py-3 !text-base border-blue-800 text-blue-800 hover:bg-blue-50">
                <i className="fab fa-facebook-f text-lg"></i>
                <span>Đăng ký bằng Facebook</span>
            </Button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;