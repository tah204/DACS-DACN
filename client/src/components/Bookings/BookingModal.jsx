import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import TimeSlotPicker from './TimeSlotPicker';
import 'react-datepicker/dist/react-datepicker.css';
import './BookingModal.css';

const BookingModal = ({ isOpen, onClose, initialCategoryId }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        serviceId: '',
        petId: '',
        doctorId: '',
        bookingDate: null,
        checkIn: null,
        checkOut: null,
        bookingTime: '',
        notes: '',
        subServiceIds: [],
    });

    const [pets, setPets] = useState([]);
    const [availableServices, setAvailableServices] = useState([]);
    const [doctors, setDoctors] = useState([]); // Thêm state bác sĩ
    const [selectedServiceDetails, setSelectedServiceDetails] = useState(null);
    const [availability, setAvailability] = useState(null);
    const [subServices, setSubServices] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const currentCategoryId = initialCategoryId?.toString();
    const serviceScrollRef = React.useRef(null);
    const doctorScrollRef = React.useRef(null);

    // Reset form khi mở modal
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setFormData({
                serviceId: '',
                petId: '',
                doctorId: '',
                bookingDate: null,
                checkIn: null,
                checkOut: null,
                bookingTime: '',
                notes: '',
                subServiceIds: [],
            });
            setPets([]);
            setAvailableServices([]);
            setDoctors([]);
            setSelectedServiceDetails(null);
            setAvailability(null);
            setSubServices([]);
            setError('');
            setSuccess('');
            setLoading(false);

            if (currentCategoryId) {
                fetchPets();
                if (currentCategoryId === '1') {
                    fetchAvailableServices(); // Dịch vụ khám
                    fetchDoctors();           // Bác sĩ
                } else if (currentCategoryId === '3') {
                    fetchAvailableServices();
                    fetchSubServices();
                } else {
                    fetchAvailableServices();
                }
            }
        }
        const preventVerticalScroll = (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Cuộn ngang theo deltaY
            if (e.currentTarget) {
                e.currentTarget.scrollLeft += e.deltaY + e.deltaX;
            }
        };

        const serviceEl = serviceScrollRef.current;
        const doctorEl = doctorScrollRef.current;

        if (serviceEl) {
            serviceEl.addEventListener('wheel', preventVerticalScroll, { passive: false });
        }
        if (doctorEl) {
            doctorEl.addEventListener('wheel', preventVerticalScroll, { passive: false });
        }

        return () => {
            if (serviceEl) serviceEl.removeEventListener('wheel', preventVerticalScroll);
            if (doctorEl) doctorEl.removeEventListener('wheel', preventVerticalScroll);
        };
    }, [isOpen, currentCategoryId]);

    // Fetch chi tiết dịch vụ khi chọn
    useEffect(() => {
        const fetchSelectedServiceDetails = async () => {
            if (!formData.serviceId) {
                setSelectedServiceDetails(null);
                return;
            }
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/api/services/${formData.serviceId}`);
                setSelectedServiceDetails(response.data);
                setError('');
            } catch (err) {
                setError('Không thể tải thông tin dịch vụ.');
            } finally {
                setLoading(false);
            }
        };
        if (formData.serviceId && isOpen) fetchSelectedServiceDetails();
    }, [formData.serviceId, isOpen]);

    const fetchAvailableServices = useCallback(async () => {
        if (!currentCategoryId) return;
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/services/category/${currentCategoryId}`);
            setAvailableServices(response.data);
        } catch (err) {
            setError('Không thể tải danh sách dịch vụ.');
        } finally {
            setLoading(false);
        }
    }, [currentCategoryId]);

    const fetchDoctors = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/doctors');
            setDoctors(response.data);
        } catch (err) {
            console.error('Lỗi tải bác sĩ:', err);
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSubServices = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/services/category/2`);
            setSubServices(response.data);
        } catch (err) {
            console.error('Lỗi tải dịch vụ phụ:', err);
        }
    }, []);

    const fetchPets = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return setError('Vui lòng đăng nhập.');
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/pets', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPets(response.data);
        } catch (err) {
            setError('Không tải được danh sách thú cưng.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Kiểm tra phòng khách sạn
    const checkAvailability = useCallback(
        debounce(async () => {
            if (selectedServiceDetails?.category === 3 && formData.checkIn && formData.checkOut) {
                setLoading(true);
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.post(
                        `http://localhost:5000/api/bookings/check-availability/${formData.serviceId}`,
                        { checkIn: formData.checkIn.toISOString(), checkOut: formData.checkOut.toISOString() },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setAvailability(response.data);
                    setError('');
                } catch (err) {
                    setError(err.response?.data?.message || 'Lỗi kiểm tra phòng.');
                    setAvailability(null);
                } finally {
                    setLoading(false);
                }
            }
        }, 500),
        [formData.checkIn, formData.checkOut, formData.serviceId, selectedServiceDetails?.category]
    );

    useEffect(() => {
        if (step === 2 && selectedServiceDetails?.category === 3) checkAvailability();
        return () => checkAvailability.cancel();
    }, [formData.checkIn, formData.checkOut, checkAvailability, step, selectedServiceDetails?.category]);

    const handleDateChange = (date, name) => {
        setFormData(prev => ({ ...prev, [name]: date }));
        setError('');
    };

    const handleTimeSelect = (time) => {
        setFormData(prev => ({ ...prev, bookingTime: time }));
        setError('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubServiceChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            subServiceIds: checked
                ? [...prev.subServiceIds, value]
                : prev.subServiceIds.filter(id => id !== value)
        }));
    };

    const handleNextStep = () => {
        setError('');
        if (step === 1) {
            if (!formData.serviceId) return setError('Vui lòng chọn dịch vụ.');
            if (currentCategoryId === '1' && !formData.doctorId) return setError('Vui lòng chọn bác sĩ.');
            if (!formData.petId) return setError('Vui lòng chọn thú cưng.');
            setStep(2);
        } else if (step === 2) {
            if (selectedServiceDetails?.category !== 3) {
                if (!formData.bookingDate || !formData.bookingTime) return setError('Vui lòng chọn ngày và giờ.');
                const bookingDateTime = moment(formData.bookingDate)
                    .hour(moment(formData.bookingTime, 'HH:mm').hour())
                    .minute(moment(formData.bookingTime, 'HH:mm').minute());
                if (bookingDateTime.isBefore(moment())) return setError('Không thể đặt lịch trong quá khứ.');
            } else {
                if (!formData.checkIn || !formData.checkOut) return setError('Vui lòng chọn ngày nhận/trả phòng.');
                if (!availability || availability.availableRooms <= 0) return setError('Không còn phòng trống.');
            }
            setStep(3);
        }
    };

    const handlePrevStep = () => {
        setStep(prev => prev - 1);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                serviceId: formData.serviceId,
                petId: formData.petId,
                notes: formData.notes,
                subServiceIds: formData.subServiceIds,
                ...(currentCategoryId === '1' && formData.doctorId ? { doctorId: formData.doctorId } : {}),
            };

            if (selectedServiceDetails?.category === 3) {
                payload.bookingDate = formData.checkIn.toISOString();
                payload.checkIn = formData.checkIn.toISOString();
                payload.checkOut = formData.checkOut.toISOString();
            } else {
                const dt = moment(formData.bookingDate)
                    .hour(moment(formData.bookingTime, 'HH:mm').hour())
                    .minute(moment(formData.bookingTime, 'HH:mm').minute());
                payload.bookingDate = dt.toISOString();
            }

            const response = await axios.post('http://localhost:5000/api/bookings', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess('Đặt lịch thành công! Đang chuyển hướng thanh toán...');
            setTimeout(() => onClose(true), 2000); // truyền true để reload danh sách
        } catch (err) {
            setError(err.response?.data?.message || 'Đặt lịch thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const getMinDate = () => moment().startOf('day').toDate();
    const getMinCheckoutDate = () => formData.checkIn ? moment(formData.checkIn).add(1, 'day').toDate() : getMinDate();

    const calculateEstimatedTotal = () => {
        let total = selectedServiceDetails?.price || 0;
        let days = 1;
        if (selectedServiceDetails?.category === 3 && formData.checkIn && formData.checkOut) {
            days = moment(formData.checkOut).startOf('day').diff(moment(formData.checkIn).startOf('day'), 'days') || 1;
            total *= days;
        }
        const subTotal = subServices
            .filter(s => formData.subServiceIds.includes(s._id))
            .reduce((sum, s) => sum + s.price, 0);
        return { total: total + subTotal, days };
    };

    const { total: estimatedTotal, days: bookingDays } = calculateEstimatedTotal();

    if (!isOpen) return null;

    return (
        <Sidebar isOpen={isOpen} onClose={onClose} title="Đặt Lịch Hẹn">
            <div className="modal-content-custom">
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="progress mb-4">
                    <div className="progress-bar bg-danger" style={{ width: `${(step / 3) * 100}%` }}>
                        Bước {step}/3
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* ==================== STEP 1 ==================== */}
                    {step === 1 && (
                    <div>
                        <h4 className="mb-4 text-center">Chọn dịch vụ & bác sĩ</h4>

                        {/* PHẦN DỊCH VỤ - Dạng ngang, cuộn được nếu nhiều */}
                        <div className="mb-5">
                            <h5 className="text-primary fw-bold mb-3">
                                {currentCategoryId === '1' ? 'Chọn gói khám' : 'Chọn dịch vụ'}
                            </h5>
                            <div className="service-scroll-container" ref={serviceScrollRef}>
                                <div className="d-flex gap-3 pb-3">
                                    {availableServices.length > 0 ? (
                                        availableServices.map(service => (
                                            <div
                                                key={service._id}
                                                className={`service-card text-center flex-shrink-0 ${formData.serviceId === service._id ? 'selected' : ''}`}
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, serviceId: service._id }));
                                                    setError('');
                                                }}
                                                style={{ width: '180px', cursor: 'pointer' }}
                                            >
                                                <img
                                                    src={`http://localhost:5000/api/images/${service.image}`}
                                                    alt={service.name}
                                                    className="rounded mb-2"
                                                    style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                                                />
                                                <h6 className="mb-1">{service.name}</h6>
                                                <p className="text-danger fw-bold small mb-0">
                                                    {service.price.toLocaleString('vi-VN')}₫
                                                </p>
                                                {formData.serviceId === service._id && (
                                                    <div className="selected-check">✓</div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted">Đang tải dịch vụ...</p>
                                    )}
                                </div>
                            </div>
                            {!formData.serviceId && <small className="text-danger">Vui lòng chọn một dịch vụ</small>}
                        </div>

                        {/* PHẦN BÁC SĨ - Chỉ hiện khi là khám bệnh */}
                        {currentCategoryId === '1' && (
                            <div className="mb-5">
                                <h5 className="text-danger fw-bold mb-3">
                                    Chọn bác sĩ
                                </h5>
                                <div className="doctor-scroll-container" ref={doctorScrollRef}>
                                    <div className="d-flex gap-3 pb-3">
                                        {doctors.length > 0 ? (
                                            doctors.map(doctor => (
                                                <div
                                                    key={doctor._id}
                                                    className={`doctor-card text-center flex-shrink-0 ${formData.doctorId === doctor._id ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, doctorId: doctor._id }));
                                                        setError('');
                                                    }}
                                                    style={{ width: '160px', cursor: 'pointer' }}
                                                >
                                                    <div className="position-relative">
                                                        <img
                                                            src={`http://localhost:5000/api/images/${doctor.image || 'default-doctor.jpg'}`}
                                                            alt={doctor.name}
                                                            className="rounded-circle mx-auto d-block mb-2"
                                                            style={{ 
                                                                width: '90px', 
                                                                height: '90px', 
                                                                objectFit: 'cover', 
                                                                border: '4px solid #fff', 
                                                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)' 
                                                            }}
                                                            onError={(e) => {
                                                                e.target.src = 'http://localhost:5000/api/images/default-doctor.jpg'; // fallback nếu ảnh lỗi
                                                            }}
                                                        />
                                                        {formData.doctorId === doctor._id && (
                                                            <div className="selected-check-doctor">✓</div>
                                                        )}
                                                    </div>
                                                    <h6 className="mb-0 fw-bold">{doctor.name}</h6>
                                                    <p className="text-muted small mb-1">{doctor.specialty}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-muted">Đang tải bác sĩ...</p>
                                        )}
                                    </div>
                                </div>
                                {!formData.doctorId && <small className="text-danger d-block">Vui lòng chọn bác sĩ</small>}
                            </div>
                        )}

                        {/* PHẦN THÚ CƯNG */}
                        <div className="mb-4">
                            <h5 className="fw-bold mb-3">Chọn thú cưng</h5>
                            {pets.length === 0 ? (
                                <div className="alert alert-warning text-center">
                                    Bạn chưa có thú cưng! <Link to="/mypets" className="text-decoration-underline">Thêm ngay</Link>
                                </div>
                            ) : (
                                <select
                                    name="petId"
                                    value={formData.petId}
                                    onChange={handleChange}
                                    className="form-select form-select-lg"
                                    required
                                >
                                    <option value="">-- Chọn thú cưng của bạn --</option>
                                    {pets.map(pet => (
                                        <option key={pet._id} value={pet._id}>
                                            {pet.name} - {pet.type} {pet.breed && `(${pet.breed})`}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* NÚT TIẾP TỤC - cố định dưới cùng */}
                        <div className="position-sticky bottom-0 bg-white pt-3 border-top" style={{ margin: '0 -1.5rem', padding: '1rem 1.5rem' }}>
                            <button
                                type="button"
                                className="btn btn-danger btn-lg w-100 shadow-lg"
                                onClick={handleNextStep}
                                disabled={loading || !formData.serviceId || (currentCategoryId === '1' && !formData.doctorId) || !formData.petId}
                            >
                                {loading ? 'Đang tải...' : 'Tiếp tục →'}
                            </button>
                        </div>
                    </div>
                )}

                    {/* ==================== STEP 2 ==================== */}
                    {step === 2 && (
                        <div>
                            <h4 className="mb-3">Chọn ngày giờ</h4>
                            {selectedServiceDetails && (
                                <p className="text-muted">Bạn đang đặt dịch vụ: <strong>{selectedServiceDetails.name}</strong></p>
                            )}

                            {selectedServiceDetails?.category === 3 ? (
                                <>
                                    <div className="mb-3">
                                        <label htmlFor="checkIn" className="form-label">Ngày nhận phòng</label>
                                        <DatePicker
                                            selected={formData.checkIn}
                                            onChange={(date) => handleDateChange(date, 'checkIn')}
                                            selectsStart
                                            startDate={formData.checkIn}
                                            endDate={formData.checkOut}
                                            minDate={getMinDate()}
                                            dateFormat="dd/MM/yyyy"
                                            className="form-control"
                                            placeholderText="Chọn ngày nhận phòng"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="checkOut" className="form-label">Ngày trả phòng</label>
                                        <DatePicker
                                            selected={formData.checkOut}
                                            onChange={(date) => handleDateChange(date, 'checkOut')}
                                            selectsEnd
                                            startDate={formData.checkIn}
                                            endDate={formData.checkOut}
                                            minDate={getMinCheckoutDate()}
                                            dateFormat="dd/MM/yyyy"
                                            className="form-control"
                                            placeholderText="Chọn ngày trả phòng"
                                            required
                                        />
                                    </div>
                                    {loading ? (
                                        <div className="text-center text-muted mb-3">Đang kiểm tra khả dụng...</div>
                                    ) : (
                                        availability && (
                                            <div className={`alert ${availability.availableRooms > 0 ? 'alert-success' : 'alert-warning'} mb-3`}>
                                                Số phòng trống: {availability.availableRooms} / {availability.totalRooms}
                                            </div>
                                        )
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="d-flex flex-column flex-lg-row gap-4 justify-content-center align-items-start">
                                        <div className="mb-3 flex-grow-1 datepicker-container">
                                            <label htmlFor="bookingDate" className="form-label">Ngày đặt hẹn</label>
                                            <DatePicker
                                                selected={formData.bookingDate}
                                                onChange={(date) => handleDateChange(date, 'bookingDate')}
                                                minDate={getMinDate()}
                                                dateFormat="dd/MM/yyyy"
                                                className="form-control"
                                                placeholderText="Chọn ngày đặt lịch"
                                                inline
                                                required
                                            />
                                        </div>
                                        <div className="mb-3 flex-grow-1 timepicker-container">
                                            <label htmlFor="bookingTime" className="form-label">Chọn giờ</label>
                                            {formData.bookingDate ? (
                                                <TimeSlotPicker
                                                    selectedDate={formData.bookingDate}
                                                    selectedTime={formData.bookingTime}
                                                    onSelectTime={handleTimeSelect}
                                                    serviceId={formData.serviceId}
                                                />
                                            ) : (
                                                <div className="alert alert-info text-center py-4">Vui lòng chọn ngày để xem giờ khả dụng.</div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                            <div className="d-flex justify-content-between">
                                <button type="button" className="btn btn-secondary" onClick={handlePrevStep}>
                                    Quay lại
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleNextStep}
                                    disabled={loading || (selectedServiceDetails?.category === 3 && (availability === null || availability.availableRooms <= 0))}
                                >
                                    Tiếp tục
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ==================== STEP 3 ==================== */}
                    {step === 3 && (
                        <div>
                            <h4 className="mb-3">Thông tin bổ sung & Xác nhận</h4>
                            
                            {/* THÊM: Phần chọn dịch vụ phụ chỉ cho Category 3 */}
                            {selectedServiceDetails?.category === 3 && subServices.length > 0 && (
                                <div className="mb-4 p-3 border rounded bg-light">
                                    <h5 className="mb-3 text-primary">Dịch vụ phụ (Chọn thêm)</h5>
                                    <div className="row">
                                        {subServices.map((sub) => (
                                            <div key={sub._id} className="col-12 col-md-6 mb-2">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        value={sub._id}
                                                        id={`subservice-${sub._id}`}
                                                        checked={formData.subServiceIds.includes(sub._id)}
                                                        onChange={handleSubServiceChange}
                                                    />
                                                    <label className="form-check-label" htmlFor={`subservice-${sub._id}`}>
                                                        {sub.name} <span className="text-muted small">({sub.price.toLocaleString('vi-VN')} VNĐ)</span>
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <div className="mb-3">
                                <label htmlFor="notes" className="form-label">Ghi chú</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    className="form-control"
                                    rows="3"
                                    placeholder="Ví dụ: Thú cưng của tôi có dị ứng với..."
                                ></textarea>
                            </div>
                            <div className="mb-3 summary-section p-3 border rounded bg-white shadow-sm">
                                <h5>Thông tin đặt lịch của bạn:</h5>
                                <p><strong>Dịch vụ chính:</strong> {selectedServiceDetails?.name || 'Đang tải...'}</p>
                                <p><strong>Thú cưng:</strong> {pets.find(p => p._id === formData.petId)?.name || 'N/A'}</p>

                                {currentCategoryId === '1' && formData.doctorId && (
                                    <p>
                                        <strong>Bác sĩ khám:</strong>{' '}
                                        <span className="text-danger fw-bold">
                                            {doctors.find(d => d._id === formData.doctorId)?.name || 'Đang tải tên bác sĩ...'}
                                        </span>
                                    </p>
                                )}

                                {selectedServiceDetails?.category === 3 ? (
                                    <>
                                        <p><strong>Ngày nhận phòng:</strong> {formData.checkIn ? moment(formData.checkIn).format('DD/MM/YYYY') : 'N/A'}</p>
                                        <p><strong>Ngày trả phòng:</strong> {formData.checkOut ? moment(formData.checkOut).format('DD/MM/YYYY') : 'N/A'}</p>
                                        <p><strong>Số ngày:</strong> {bookingDays} ngày</p>
                                        <p><strong>Dịch vụ phụ đã chọn:</strong> {formData.subServiceIds.length > 0 ? formData.subServiceIds.length + ' dịch vụ' : 'Không có'}</p>
                                    </>
                                ) : (
                                    <>
                                        <p><strong>Ngày đặt:</strong> {formData.bookingDate ? moment(formData.bookingDate).format('DD/MM/YYYY') : 'N/A'}</p>
                                        <p><strong>Giờ đặt:</strong> {formData.bookingTime || 'N/A'}</p>
                                    </>
                                )}
                                <p><strong>Ghi chú:</strong> {formData.notes || 'Không có'}</p>
                                <div className="mt-3 border-top pt-2">
                                    <p className="fw-bold text-success fs-5">
                                        <strong>Tổng tiền ước tính: </strong>
                                        {estimatedTotal.toLocaleString('vi-VN')} VNĐ
                                    </p>
                                </div>
                            </div>
                            <div className="d-flex justify-content-between">
                                <button type="button" className="btn btn-secondary" onClick={handlePrevStep}>
                                    Quay lại
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-danger"
                                    disabled={loading || (selectedServiceDetails?.category === 3 && (availability === null || availability.availableRooms <= 0))}
                                >
                                    {loading ? 'Đang xác nhận...' : 'Xác nhận đặt lịch'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </Sidebar>
    );
};

export default BookingModal;