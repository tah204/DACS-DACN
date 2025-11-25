import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment'; // Thêm moment để xử lý ngày tháng tốt hơn

const BookingHistory = () => {
    const [completedBookings, setCompletedBookings] = useState([]);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserAndCompletedBookings = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                const token = localStorage.getItem('token');

                if (!token) {
                    setError('Vui lòng đăng nhập để xem lịch sử dịch vụ đã sử dụng.');
                    setLoading(false);
                    return;
                }

                let userData = storedUser ? JSON.parse(storedUser) : null;
                if (!userData) {
                    const userResponse = await axios.get('http://localhost:5000/auth/user/profile', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    userData = userResponse.data;
                    localStorage.setItem('user', JSON.stringify(userData));
                }
                setUser(userData);

                if (!userData.customerId) {
                    setError('Thông tin người dùng không đầy đủ. Vui lòng đăng nhập lại.');
                    setLoading(false);
                    return;
                }

                const bookingResponse = await axios.get('http://localhost:5000/api/bookings', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Lọc các đơn hàng đã hoàn thành hoặc đã hủy
                const completedOrCanceled = bookingResponse.data.filter((booking) =>
                    booking.status === 'completed' || booking.status === 'canceled'
                );
                setCompletedBookings(completedOrCanceled);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching completed bookings:', error.response?.data || error.message);
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                } else {
                    setError('Không thể tải lịch sử dịch vụ đã sử dụng. Vui lòng thử lại sau.');
                }
                setLoading(false);
            }
        };

        fetchUserAndCompletedBookings();
    }, []);

    const calculateDays = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return 0;
        const start = moment(checkIn);
        const end = moment(checkOut);
        return Math.ceil(end.diff(start, 'days'));
    };

    /**
     * Hàm tính tổng tiền: Ưu tiên lấy totalAmount từ booking object (backend tính toán)
     */
    const computeTotalAmount = (booking) => {
        if (booking?.totalAmount && !Number.isNaN(Number(booking.totalAmount))) {
            return Number(booking.totalAmount);
        }

        // Fallback calculation (same logic as MyBookings)
        const isHotelService = booking.serviceId?.category === 3;
        const days = isHotelService ? calculateDays(booking.checkIn, booking.checkOut) : 1;
        const price = booking.serviceId?.price || 0;

        return price * (days > 0 ? days : 1);
    };


    const getStatusDisplay = (status) => {
        let statusBadgeClass = '';
        let statusText = '';
        switch (status) {
            case 'completed':
                statusBadgeClass = 'bg-primary';
                statusText = 'Đã hoàn thành';
                break;
            case 'canceled':
                statusBadgeClass = 'bg-danger';
                statusText = 'Đã hủy';
                break;
            default:
                statusBadgeClass = 'bg-secondary';
                statusText = 'Không xác định';
        }
        return { statusBadgeClass, statusText };
    };

    if (loading) return <div className="text-center py-5">Đang tải...</div>;
    if (error) return <div className="text-center py-5 text-danger">{error}</div>;

    return (
        <section className="my-booking-section py-5 bg-light" style={{ marginTop: '40px' }}>
            <div className="container">
                <h2 className="text-center mb-5 fw-bold" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                    Lịch Sử Dịch Vụ Đã Sử Dụng
                </h2>
                
                {completedBookings.length === 0 ? (
                    <div className="text-center p-5 border rounded bg-white shadow-sm">
                        <p className="mb-4">Bạn chưa có dịch vụ nào đã hoàn thành hoặc đã hủy.</p>
                        <div className="d-flex justify-content-center gap-3">
                            <Link to="/services" className="btn btn-primary">
                                Đặt Dịch Vụ Ngay
                            </Link>
                            <Link to="/mybookings" className="btn btn-secondary">
                                Xem Đơn Đặt Dịch Vụ Đang Chờ
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="row g-4">
                        {completedBookings.map((booking) => {
                            const serviceName = booking.serviceId?.name || 'Dịch vụ không xác định';
                            const isHotelService = booking.serviceId?.category === 3;
                            const { statusBadgeClass, statusText } = getStatusDisplay(booking.status);
                            const finalTotalAmount = computeTotalAmount(booking);
                            const days = isHotelService ? calculateDays(booking.checkIn, booking.checkOut) : 0;
                            
                            return (
                                <div key={booking._id} className="col-12 col-md-6 col-lg-4">
                                    <div className="card h-100 shadow-sm border-0">
                                        <div className="card-body">
                                            <h5 className="card-title text-dark">
                                                {isHotelService ? `Khách sạn: ${serviceName}` : serviceName}
                                            </h5>
                                            <p className="card-text text-muted mb-2">
                                                Thú cưng: {booking.petId?.name || 'Không xác định'}
                                            </p>

                                            {/* --- HIỂN THỊ THÔNG TIN THEO LOẠI DỊCH VỤ --- */}
                                            {isHotelService ? (
                                                <>
                                                    <p className="card-text mb-2">
                                                        Nhận phòng: {booking.checkIn
                                                            ? moment(booking.checkIn).format('DD/MM/YYYY')
                                                            : 'N/A'}
                                                    </p>
                                                    <p className="card-text mb-2">
                                                        Trả phòng: {booking.checkOut
                                                            ? moment(booking.checkOut).format('DD/MM/YYYY')
                                                            : 'N/A'}
                                                    </p>
                                                    {days > 0 && <p className="card-text mb-2 text-primary">Tổng số ngày: {days}</p>}
                                                    
                                                    {/* ✅ HIỂN THỊ DỊCH VỤ PHỤ */}
                                                    {booking.subServices && booking.subServices.length > 0 && (
                                                        <div className="mt-2 p-2 border rounded bg-light">
                                                            <p className="fw-bold mb-1 text-dark">Dịch vụ phụ:</p>
                                                            <ul className="list-unstyled mb-0 small">
                                                                {/* Giả định subServices đã được populate (ID -> Object) */}
                                                                {booking.subServices.map((sub, index) => (
                                                                    <li key={index} className="text-muted">
                                                                        - {sub.name || 'Dịch vụ không tên'} ({sub.price ? `${sub.price.toLocaleString('vi-VN')} VNĐ` : 'Miễn phí'})
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="card-text mb-2">
                                                    Ngày hẹn: {booking.bookingDate
                                                        ? moment(booking.bookingDate).format('HH:mm - DD/MM/YYYY')
                                                        : 'Không áp dụng'}
                                                </p>
                                            )}
                                            
                                            {/* --- TỔNG TIỀN (CHÍNH XÁC) --- */}
                                            <p className="card-text mb-2 fw-bold text-danger fs-5">
                                                Tổng tiền: {finalTotalAmount.toLocaleString('vi-VN')} VNĐ
                                            </p>

                                            {booking.notes && (
                                                <p className="card-text mb-2">
                                                    <small className="text-black-50">Ghi chú: {booking.notes}</small>
                                                </p>
                                            )}

                                            <p className="card-text">
                                                <span className={`badge ${statusBadgeClass} p-2`}>{statusText}</span>
                                                {booking.paymentStatus === 'success' && (
                                                    <span className="badge bg-primary p-2 ms-2">Đã thanh toán</span>
                                                )}
                                                {(booking.paymentStatus === 'pending' && booking.status !== 'canceled') && (
                                                    <span className="badge bg-warning text-dark p-2 ms-2">Chờ thanh toán</span>
                                                )}
                                            </p>

                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                
                <div className="text-center mt-5">
                    <Link to="/mybookings" className="btn btn-secondary btn-lg">
                        Quay Lại Đơn Đặt Dịch Vụ Đang Chờ
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default BookingHistory;