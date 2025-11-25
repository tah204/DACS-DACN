import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { PayPalButtons } from "@paypal/react-paypal-js";

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [payingBooking, setPayingBooking] = useState(null);
    const [payLoading, setPayLoading] = useState(false);

    useEffect(() => {
        const fetchUserAndBookings = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                const token = localStorage.getItem('token');

                if (!token) {
                    setError('Vui lòng đăng nhập để xem lịch sử đặt dịch vụ.');
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

                const activeBookings = bookingResponse.data.filter(
                    (booking) => booking.status === 'pending' || booking.status === 'active'
                );
                setBookings(activeBookings);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching bookings:', error.response?.data || error.message);
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                } else {
                    setError('Không thể tải lịch sử đặt dịch vụ. Vui lòng thử lại sau.');
                }
                setLoading(false);
            }
        };

        fetchUserAndBookings();
    }, []);

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy đặt dịch vụ này?')) return;

        setCancelLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5000/api/bookings/${bookingId}`,
                { status: 'canceled' },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Cập nhật UI: Lọc bỏ đơn hàng đã hủy
            setBookings((prevBookings) =>
                prevBookings.filter((booking) => booking._id !== bookingId)
            );
            alert('Hủy đặt dịch vụ thành công.');
        } catch (error) {
            console.error('Error canceling booking:', error.response?.data || error.message);
            alert(error.response?.data?.message || 'Hủy đặt dịch vụ thất bại. Vui lòng thử lại.');
        } finally {
            setCancelLoading(false);
        }
    };

    const calculateDays = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return 0;
        const start = moment(checkIn);
        const end = moment(checkOut);
        return Math.ceil(end.diff(start, 'days'));
    };

    /**
     * Hàm tính tổng tiền: Ưu tiên lấy totalAmount từ booking object (backend tính toán)
     * Nếu không có (hoặc NaN), tính lại dựa trên giá dịch vụ chính (fallback)
     */
    const computeTotalAmount = (booking) => {
        // Kiểm tra booking.totalAmount từ backend
        if (booking?.totalAmount && !Number.isNaN(Number(booking.totalAmount))) {
            return Number(booking.totalAmount);
        }

        // Trường hợp fallback: tính lại bằng giá dịch vụ chính
        const isHotelService = booking.serviceId?.category === 3;
        const days = isHotelService ? calculateDays(booking.checkIn, booking.checkOut) : 1;
        const price = booking.serviceId?.price || 0;

        return price * (days > 0 ? days : 1);
    };

    const handleOpenPayModal = (booking) => {
        setPayingBooking(booking);
    };

    const handleClosePayModal = () => {
        setPayingBooking(null);
        setPayLoading(false);
    };

    const handlePayWithVNPay = async () => {
        if (!payingBooking) return;
        try {
            setPayLoading(true);
            const amount = computeTotalAmount(payingBooking);
            const orderId = payingBooking._id;
            const resp = await axios.post('http://localhost:5000/api/payment/vnpay/create', {
                amount,
                orderId,
            });
            const url = resp?.data?.data;
            if (url) {
                window.location.href = url;
            } else {
                alert('Không tạo được link thanh toán VNPay.');
            }
        } catch (e) {
            alert('Lỗi khi tạo link thanh toán: ' + (e.response?.data?.message || e.message));
        } finally {
            setPayLoading(false);
        }
    };

    const handlePayWithMoMo = async () => {
        if (!payingBooking) return;
        try {
            setPayLoading(true);
            const amount = computeTotalAmount(payingBooking);
            const bookingId = payingBooking._id;
            const resp = await axios.post('http://localhost:5000/api/payment/momo/create', {
                amount,
                bookingId,
            });
            const url = resp?.data?.data;
            if (url) {
                window.location.href = url;
            } else {
                alert('Không tạo được link thanh toán MoMo.');
            }
        } catch (e) {
            alert('Lỗi khi tạo link thanh toán MoMo: ' + (e.response?.data?.message || e.message));
        } finally {
            setPayLoading(false);
        }
    };

    const handlePayPalSuccess = async (bookingId, paypalOrderId, details) => {
        setPayLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                setPayLoading(false);
                return;
            }

            const response = await axios.put(
                `http://localhost:5000/api/bookings/${bookingId}`,
                {
                    paymentStatus: 'success',
                    paymentMethod: 'paypal',
                    paymentDetails: {
                        orderId: paypalOrderId,
                        payerId: details.payer.payer_id,
                        payerEmail: details.payer.email_address,
                        status: details.status
                    }
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert('Thanh toán PayPal thành công!');

            setBookings((prevBookings) =>
                prevBookings.map((booking) =>
                    booking._id === bookingId ? response.data : booking 
                )
            );

            handleClosePayModal();
        } catch (error) {
            console.error('Lỗi khi cập nhật booking sau khi thanh toán:', error.response?.data || error.message);
            alert('Thanh toán thành công nhưng có lỗi khi cập nhật đơn hàng trên hệ thống. Vui lòng liên hệ CSKH với mã giao dịch: ' + paypalOrderId);
        } finally {
            setPayLoading(false);
        }
    };

    if (loading) return <div className="text-center py-5">Đang tải...</div>;
    if (error) return <div className="text-center py-5 text-danger">{error}</div>;

    return (
        <section className="booking-history-section py-5 bg-light" style={{ marginTop: '40px' }}>
            <div className="container">
                <h2 className="text-center mb-5 fw-bold" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                    Đơn Đặt Dịch Vụ Đang Chờ
                </h2>

                {bookings.length === 0 ? (
                    <div className="text-center p-5 border rounded bg-white shadow-sm">
                        <p className="mb-4">Bạn chưa có đặt dịch vụ nào đang chờ xử lý.</p>
                        <Link to="/services" className="btn btn-primary btn-lg">
                            Đặt Dịch Vụ Ngay
                        </Link>
                    </div>
                ) : (
                    <div className="row g-4">
                        {bookings.map((booking) => {
                            // 1. Lấy Tên Dịch Vụ
                            const serviceName = booking.serviceId?.name || 'Dịch vụ không xác định';

                            // 2. Kiểm tra loại dịch vụ
                            const isHotelService = booking.serviceId?.category === 3;
                            
                            // 3. Tính toán tổng tiền
                            const finalTotalAmount = computeTotalAmount(booking);
                            const days = isHotelService ? calculateDays(booking.checkIn, booking.checkOut) : 0;

                            // 4. Trạng thái và Badge
                            let statusBadgeClass = '';
                            let statusText = '';
                            switch (booking.status) {
                                case 'pending':
                                    statusBadgeClass = 'bg-warning text-dark';
                                    statusText = 'Đang chờ xử lý';
                                    break;
                                case 'active':
                                    statusBadgeClass = 'bg-success';
                                    statusText = 'Đã xác nhận';
                                    break;
                                default:
                                    statusBadgeClass = 'bg-secondary';
                                    statusText = 'Không xác định';
                            }

                            return (
                                <div key={booking._id} className="col-12 col-md-6 col-lg-4">
                                    <div className="card h-100 shadow-sm border-0">
                                        <div className="card-body">
                                            <h5 className="card-title text-dark">
                                                {isHotelService ? `${serviceName}` : serviceName}
                                            </h5>
                                     
                                            <p className="card-text text-muted mb-2">
                                                Thú cưng: {booking.petId?.name || 'Không xác định'}
                                            </p>

                                            {/* --- HIỂN THỊ THÔNG TIN THEO LOẠI DỊCH VỤ --- */}
                                            {isHotelService ? (
                                                <>
                                                    <p className="card-text mb-2">
                                                        Ngày nhận phòng:{' '}
                                                        {booking.checkIn
                                                            ? moment(booking.checkIn).format('DD/MM/YYYY')
                                                            : 'N/A'}
                                                    </p>
                                                    <p className="card-text mb-2">
                                                        Ngày trả phòng:{' '}
                                                        {booking.checkOut
                                                            ? moment(booking.checkOut).format('DD/MM/YYYY')
                                                            : 'N/A'}
                                                    </p>
                                                  
                                                    {days > 0 && <p className="card-text mb-2 text-primary">Tổng số ngày: {days}</p>}
                                                    
                                                 
                                                    {booking.subServices && booking.subServices.length > 0 && (
                                                        <div className="mt-2 p-2 border rounded bg-light">
                                                            <p className="fw-bold mb-1 text-dark">Dịch vụ phụ đã chọn:</p>
                                                            <ul className="list-unstyled mb-0 small">
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
                                                    Giờ hẹn:{' '}
                                                    {booking.bookingDate
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
                                                {booking.paymentStatus === 'pending' && booking.status !== 'pending' && (
                                                    <span className="badge bg-warning text-dark p-2 ms-2">Chờ thanh toán</span>
                                                )}
                                            </p>

                                            {/* --- ACTION BUTTONS --- */}
                                            {(booking.paymentStatus !== 'success') &&
                                                (booking.status === 'pending' || booking.status === 'active') && (
                                                    <div className="d-flex gap-2 mt-3">
                                                        <button
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => handleCancelBooking(booking._id)}
                                                            disabled={cancelLoading}
                                                        >
                                                            {cancelLoading ? 'Đang hủy...' : 'Hủy Đặt'}
                                                        </button>
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => handleOpenPayModal(booking)}
                                                            disabled={payLoading}
                                                        >
                                                            Thanh toán
                                                        </button>
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="text-center mt-5">
                    <Link to="/bookinghistory" className="btn btn-secondary btn-lg">
                        Xem Lịch Sử Đặt Dịch Vụ Đã Hoàn Thành/Hủy
                    </Link>
                </div>
            </div>

            {/* Payment Modal */}
            {payingBooking && (
                <div
                    className="modal fade show"
                    style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Chọn phương thức thanh toán</h5>
                                <button type="button" className="btn-close" onClick={handleClosePayModal}></button>
                            </div>
                            <div className="modal-body">
                                <p className="mb-3">
                                    Tổng tiền:{' '}
                                    <strong>
                                        {computeTotalAmount(payingBooking).toLocaleString('vi-VN')} VNĐ
                                    </strong>
                                </p>
                                <div className="d-grid gap-2">
                                    <button
                                        className="btn btn-primary"
                                        onClick={handlePayWithVNPay}
                                        disabled={payLoading}
                                    >
                                        {payLoading ? 'Đang chuyển đến VNPay...' : 'Thanh toán qua VNPay'}
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        style={{ backgroundColor: '#A50064', borderColor: '#A50064' }}
                                        onClick={handlePayWithMoMo}
                                        disabled={payLoading}
                                    >
                                        {payLoading ? 'Đang chuyển đến MoMo...' : 'Thanh toán qua MoMo'}
                                    </button>

                                    {/* --- PAYPAL BUTTON --- */}
                                    <PayPalButtons
                                        fundingSource="paypal"
                                        style={{
                                            layout: "vertical",
                                            color: "gold",
                                            shape: "rect",
                                            label: "paypal"
                                        }}
                                        createOrder={(data, actions) => {
                                            const amountUSD = (computeTotalAmount(payingBooking) / 25000).toFixed(2);
                                            return actions.order.create({
                                                purchase_units: [
                                                    {
                                                        amount: { 
                                                            currency_code: 'USD',
                                                            value: amountUSD 
                                                        },
                                                        custom_id: payingBooking._id.toString()
                                                    },
                                                ],
                                            });
                                        }}
                                        onApprove={async (data, actions) => {
                                            try {
                                                const details = await actions.order.capture();
                                                await handlePayPalSuccess(payingBooking._id, data.orderID, details);
                                            } catch (err) {
                                                console.error("Lỗi khi capture đơn hàng PayPal:", err);
                                                alert('Lỗi khi xử lý thanh toán PayPal. Giao dịch có thể chưa hoàn tất.');
                                            }
                                        }}
                                        onError={(err) => alert('Lỗi khi thanh toán PayPal: ' + err)}
                                    />

                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleClosePayModal}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default MyBookings;