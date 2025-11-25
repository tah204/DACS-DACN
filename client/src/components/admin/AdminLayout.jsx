import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaBox, FaConciergeBell, FaNewspaper, FaUsers, FaSignOutAlt, FaHome, FaCalendarAlt, FaStethoscope } from 'react-icons/fa';

const AdminLayout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/'); // Quay lại trang chủ sau khi đăng xuất
  };

  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar */}
      <div className="bg-dark text-white p-3" style={{ width: '250px', position: 'fixed', height: '100vh' }}>
        <h4 className="text-center mb-4"><strong style={{ color: 'white'}}>Admin Panel</strong></h4>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <Link to="/admin/dashboard" className="nav-link text-white">
              <FaTachometerAlt className="me-2" /> Dashboard
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/categoryservice" className="nav-link text-white">
              <FaBox className="me-2" /> Quản Lý Danh Mục Dịch Vụ
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/services" className="nav-link text-white">
              <FaConciergeBell className="me-2" /> Quản Lý Dịch Vụ
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/news" className="nav-link text-white">
              <FaNewspaper className="me-2" /> Quản Lý Tin Tức
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/customers" className="nav-link text-white">
              <FaUsers className="me-2" /> Quản Lý Khách Hàng
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/bookings" className="nav-link text-white">
              <FaCalendarAlt className="me-2" /> Quản Lý Đơn Đặt Dịch Vụ
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/doctor" className="nav-link text-white"> {/* Sửa 'nav-lin' */}
              <FaStethoscope className="me-2" /> Quản Lý Bác Sĩ {/* Thêm icon và text */}
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/" className="nav-link text-white">
              <FaHome className="me-2" /> Quay Về Trang Chủ
            </Link>
          </li>
          <li className="nav-item mt-4">
            <button className="nav-link text-white bg-transparent border-0" onClick={handleLogout}>
              <FaSignOutAlt className="me-2" /> Đăng Xuất
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1" style={{ marginLeft: '250px' }}>
        <header className="bg-primary text-white p-3 shadow-sm">
          <h5 className="mb-0">Chào {user.username || 'Admin'}!</h5>
        </header>
        <main className="container-fluid p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;