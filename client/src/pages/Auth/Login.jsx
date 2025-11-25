import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (showMessage) {
      timer = setTimeout(() => setShowMessage(false), 1000);
    }
    return () => clearTimeout(timer);
  }, [showMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setShowMessage(false);
    if (password.length < 6) {
      setMessage('Mật khẩu phải dài ít nhất 6 ký tự');
      setShowMessage(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      setMessage(data.message);
      setShowMessage(true);

      if (response.ok) {
        setTimeout(() => {
          // Bỏ setUser vì không cần thiết, thông tin đã được lưu vào localStorage
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('token', data.token);
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      setMessage('Lỗi kết nối máy chủ');
      setShowMessage(true);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card p-4 shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4">Đăng Nhập</h2>
        {showMessage && (
          <div className={`alert ${message.includes('thành công') ? 'alert-success' : 'alert-danger'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Tên đăng nhập</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Đăng nhập
          </button>
        </form>
        <div className="text-center mt-3">
          <Link to="/register" className="btn btn-link text-primary">
            Chưa có tài khoản? Đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;