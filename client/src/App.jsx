import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Layout from './layouts/Layout';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import ServiceManagement from './components/admin/ServiceManagement';
import NewsManagement from './components/admin/NewsManagement';
import UserManagement from './components/admin/UserManagement';
import CategoryServiceManagement from './components//admin/CategoryServiceManagement';
import CustomerManagement from './components/admin/CustomerManagement';
import BookingManagement from './components/admin/BookingManagement';
import DoctorManagement from './components/admin/DoctorManagement';
import CustomerDetail from './components/admin/CustomerDetail';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import News from './pages/News/News';
import NewsDetail from './pages/News/NewsDetail';
import ActiveBookings from './pages/Bookings/MyBookings';
import PaymentResult from './pages/Bookings/PaymentResult';
import BookingHistory from './pages/Bookings/BookingHistory';
import BookingShipment from './pages/Bookings/BookingShipment';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Account from './pages/Profiles/Account';
import MyPets from './pages/Profiles/MyPets';
import Services from './pages/Services/Services';
import ServiceHealthDetail from './pages/Services/ServiceHealthDetail';
import ServiceGroomDetail from './pages/Services/ServiceGroomDetail';
import ServiceHotelDetail from './pages/Services/ServiceHotelDetail';
import ServiceShipmentDetail from './pages/Services/ServiceShipmentDetail';
import DoctorDetail from './pages/Doctors/DoctorDetail';
import Doctor from './pages/Doctors/DoctorPage';

// Component trung gian để chọn đúng trang chi tiết dựa trên category ID
const CategoryServiceDetail = () => {
  const { id } = useParams(); 
  const categoryId = parseInt(id, 10);

  // Chọn component dựa trên categoryId
  switch (categoryId) {
    case 1:
      return <ServiceHealthDetail />;
    case 2:
      return <ServiceGroomDetail />;
    case 3:
      return <ServiceHotelDetail />;
    case 4:
      return <ServiceShipmentDetail />;
    default:
      return <Navigate to="/services" replace />; 
  }
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AuthenticatedRedirect = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes sử dụng Layout (cho người dùng thông thường) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="categoryservices/:id" element={<CategoryServiceDetail />} /> {/* Tất cả danh mục dùng Layout */}
          <Route path="news" element={<News />} />
          <Route path="news/:id" element={<NewsDetail />} />
          <Route path="account" element={<Account />} />
          <Route path="mypets" element={<MyPets />} />
          <Route path="payment-result" element={<PaymentResult />} />
          <Route path="doctors" element={<Doctor />} />
          <Route path="doctors/:id" element={<DoctorDetail />} />
          <Route path="shipment" element={<BookingShipment />} />
          <Route
            path="mybookings"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <ActiveBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="bookinghistory"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <BookingHistory />
              </ProtectedRoute>
            }
          />
        </Route>
        
        {/* Routes cho admin */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="categoryservice" element={<CategoryServiceManagement />} />
          <Route path="services" element={<ServiceManagement />} />
          <Route path="news" element={<NewsManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="bookings" element={<BookingManagement />} />
          <Route path="doctor" element={<DoctorManagement />} />
        </Route>

        {/* Routes cho đăng nhập và đăng ký */}
        <Route
          path="/login"
          element={
            <AuthenticatedRedirect>
              <Login />
            </AuthenticatedRedirect>
          }
        />
        <Route
          path="/register"
          element={
            <AuthenticatedRedirect>
              <Register />
            </AuthenticatedRedirect>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;