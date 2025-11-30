import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { FaInstagram, FaTiktok, FaFacebook, FaYoutube } from 'react-icons/fa';

const Layout = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* NAVBAR */}
      <header className="navbar navbar-expand-lg navbar-light fixed-top" style={{ backgroundColor: '#FAF7F1' }}>
        <div className="container">
          {/* Logo */}
          <Link className="navbar-brand d-flex align-items-center fw-bold" to="/home" style={{ color: '#8B0000' }}>
            <img src="/images/logo.jpg" alt="NekoKin Logo" style={{ height: 40 }} className="me-2" />
            PetHub
          </Link>

          {/* Mobile toggle */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Menu và nút */}
          <div className="collapse navbar-collapse" id="navbarNav" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            <ul className="navbar-nav mx-auto">
              <li className="nav-item"><Link className="nav-link fw-semibold" to="/home">Trang chủ</Link></li>
              <li className="nav-item"><Link className="nav-link fw-semibold" to="/about">Giới thiệu</Link></li>
              <li className="nav-item"><Link className="nav-link fw-semibold" to="/services">Dịch vụ</Link></li>
              <li className="nav-item"><Link className="nav-link fw-semibold" to="/doctors">Bác Sĩ</Link></li>
              <li className="nav-item"><Link className="nav-link fw-semibold" to="/news">Tin tức</Link></li>
              
            </ul>

            <div className="d-flex align-items-center position-relative">
              {user ? (
                <>
                  <div className="dropdown me-3">
                    <span
                      className="text-muted cursor-pointer dropdown-toggle"
                      style={{
                        fontWeight: 'bold',
                        fontFamily: 'Quicksand, sans-serif',
                        padding: '5px 10px',
                        border: '2px solid #8B0000',
                        borderRadius: '5px',
                        transition: 'all 0.2s',
                        color: '#8B0000',
                      }}
                      id="userDropdown"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e6e6fa';
                        e.currentTarget.style.borderColor = '#6A0DAD';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = '#8B0000';
                      }}
                    >
                      {user.username}
                    </span>
                    <ul
                      className="dropdown-menu dropdown-menu-end"
                      aria-labelledby="userDropdown"
                      style={{
                        borderRadius: '10px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        backgroundColor: '#FAF7F1',
                        minWidth: '180px',
                        border: 'none',
                        padding: '8px',
                        marginTop: '5px',
                      }}
                    >
                      <li>
                        <button
                          className="dropdown-item text-start"
                          style={{
                            fontFamily: 'Quicksand, sans-serif',
                            borderRadius: '5px',
                            padding: '8px 20px',
                            transition: 'background-color 0.2s',
                            color: '#333',
                          }}
                          onClick={() => handleNavigate('/account')}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e6e6fa')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          Tài khoản
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item text-start"
                          style={{
                            fontFamily: 'Quicksand, sans-serif',
                            borderRadius: '5px',
                            padding: '8px 20px',
                            transition: 'background-color 0.2s',
                            color: '#333',
                          }}
                          onClick={() => handleNavigate('/mypets')}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e6e6fa')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          Thú cưng của tôi
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item text-start"
                          style={{
                            fontFamily: 'Quicksand, sans-serif',
                            borderRadius: '5px',
                            padding: '8px 20px',
                            transition: 'background-color 0.2s',
                            color: '#333',
                          }}
                          onClick={() => handleNavigate('/mybookings')}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e6e6fa')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          Dịch vụ của tôi
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item text-start"
                          style={{
                            fontFamily: 'Quicksand, sans-serif',
                            borderRadius: '5px',
                            padding: '8px 20px',
                            color: '#8B0000',
                            transition: 'background-color 0.2s',
                          }}
                          onClick={handleLogout}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8e1e1')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          Đăng xuất
                        </button>
                      </li>
                    </ul>
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      className="btn btn-sm ms-2"
                      style={{ backgroundColor: '#8B0000', color: 'white' }}
                    >
                      Quản trị
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-sm" style={{ backgroundColor: '#8B0000', color: 'white' }}>
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-sm ms-2"
                    style={{ backgroundColor: '#8B0000', color: 'white' }}
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* TRANG NỘI DUNG */}
      <main className="flex-grow-1">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="text-white py-5 mt-auto" style={{ backgroundColor: '#0d2554' }}>
        <div className="container">
          <div className="row gy-4 gx-2"> {/* Bỏ text-center khỏi row chính */}
            {/* Cột 1: Giới thiệu */}
            <div className="col-12 col-md-4 text-start"> {/* Thêm text-start để căn trái */}
              <p style={{ fontFamily: 'Quicksand, sans-serif', lineHeight: '1.8', fontSize: '15px', color: 'rgba(255, 255, 255, 0.7)' }}> {/* Giảm độ đậm của text-white-50 thành rgba */}
                <strong style={{ color: 'white', fontSize: '30px' }}>PetHub </strong> là cộng đồng cung cấp sản phẩm và dịch vụ chăm sóc thú cưng tốt nhất – nơi bạn có thể tin tưởng hoàn toàn cho bé cưng của mình.
              </p>
              <div className="mt-3">
                <p className="mb-0" style={{ fontFamily: 'Quicksand, sans-serif', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}> {/* Giảm độ đậm của text-white-50 thành rgba */}
                  <strong style={{ color: 'white' }}>Hotline:</strong> 0923 456 897
                </p>
                <p className="mb-1" style={{ fontFamily: 'Quicksand, sans-serif', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}> {/* Giảm độ đậm của text-white-50 thành rgba */}
                  <strong style={{ color: 'white' }}>Địa chỉ:</strong> 272 Đường Điện Biên Phủ, Quận 2, TP.HCM
                </p>
              </div>
            </div>

            {/* Cột 2: Liên kết nhanh */}
            <div className="col-12 col-md-4 text-center"> {/* Thêm text-start để căn trái */}
              <h5 className="mb-3 fw-bold" style={{ color: 'white', fontFamily: 'Quicksand, sans-serif', letterSpacing: '1px' }}>Danh Mục</h5>
              <ul className="list-unstyled d-flex flex-column gap-2"> {/* Bỏ align-items-center */}
                <li><Link to="/home" className="text-white text-decoration-none" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#8B0000'} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>Trang chủ</Link></li>
                <li><Link to="/about" className="text-white text-decoration-none" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#8B0000'} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>Giới thiệu</Link></li>
                <li><Link to="/services" className="text-white text-decoration-none" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#8B0000'} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>Dịch vụ</Link></li>
                <li><Link to="/news" className="text-white text-decoration-none" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#8B0000'} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>Tin tức</Link></li>
              </ul>
            </div>

            {/* Cột 3: Mạng xã hội */}
            <div className="col-12 col-md-4 text-start"> {/* Thêm text-start để căn trái */}
              <h5 className="mb-3 fw-bold" style={{ color: 'white', fontFamily: 'Quicksand, sans-serif', letterSpacing: '1px' }}>Mạng xã hội</h5>
              <div className="d-flex gap-3"> {/* Bỏ justify-content-center */}
                <a
                  href="https://www.facebook.com/neko.kin"
                  className="text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ transition: 'transform 0.2s, color 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)'; e.currentTarget.style.color = '#3b5998'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.color = 'white'; }}
                >
                  <FaFacebook size={24} />
                </a>
                <a
                  href="https://www.instagram.com/neko.kin"
                  className="text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ transition: 'transform 0.2s, color 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)'; e.currentTarget.style.color = '#C13584'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.color = 'white'; }}
                >
                  <FaInstagram size={24} />
                </a>
                <a
                  href="https://www.tiktok.com/@neko.kin"
                  className="text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ transition: 'transform 0.2s, color 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)'; e.currentTarget.style.color = '#69C9D0'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.color = 'white'; }}
                >
                  <FaTiktok size={24} />
                </a>
                <a
                  href="https://www.youtube.com/@NekoKin" 
                  className="text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ transition: 'transform 0.2s, color 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)'; e.currentTarget.style.color = '#FF0000'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.color = 'white'; }}
                >
                  <FaYoutube size={24} />
                </a>
              </div>
            </div>
          </div>

          {/* Dòng dưới cùng */}
          <div className="text-start mt-4 border-top pt-3 small" style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}> {/* Thêm text-start và giảm độ đậm */}
            © 2025 NekoKin. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;