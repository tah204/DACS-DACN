import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import './TimeSlotPicker.css';

const TimeSlotPicker = ({ selectedDate, selectedTime, onSelectTime, serviceId }) => {
    const [availableTimes, setAvailableTimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Danh sách khung giờ mặc định (8:00–15:00, cách 30 phút)
    const defaultTimeSlots = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
        '14:00', '14:30', '15:00'
    ];

    useEffect(() => {
        const fetchAvailableTimes = async () => {
            if (!selectedDate || !serviceId) {
                console.log('Missing selectedDate or serviceId:', { selectedDate, serviceId });
                setError('Vui lòng chọn ngày và dịch vụ.');
                setAvailableTimes(defaultTimeSlots); // Hiển thị tất cả khung giờ mặc định nếu thiếu dữ liệu
                return;
            }

            if (isNaN(new Date(selectedDate)) || !moment(selectedDate).isValid()) {
                console.log('Invalid selectedDate:', selectedDate);
                setError('Ngày không hợp lệ.');
                setAvailableTimes(defaultTimeSlots); // Hiển thị tất cả khung giờ mặc định nếu ngày không hợp lệ
                return;
            }

            setLoading(true);
            setError('');
            try {
                const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
                console.log('Fetching available times for date:', formattedDate, 'and serviceId:', serviceId);
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Token không tìm thấy. Vui lòng đăng nhập lại.');
                }
                const response = await axios.get(
                    `http://localhost:5000/api/bookings/available-times/${serviceId}?date=${formattedDate}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                console.log('API response:', response.data);
                setAvailableTimes(response.data.availableTimes || defaultTimeSlots); // Sử dụng availableTimes từ API, nếu rỗng thì dùng default
            } catch (err) {
                console.error('Error fetching available times:', err);
                setError(err.message || err.response?.data?.message || 'Không thể tải khung giờ trống.');
                setAvailableTimes(defaultTimeSlots); // Hiển thị tất cả khung giờ mặc định nếu có lỗi
            } finally {
                setLoading(false);
            }
        };

        fetchAvailableTimes();
    }, [selectedDate, serviceId]);

    const handleTimeSelect = (time) => {
        console.log('Selected time:', time);
        onSelectTime(time);
    };

    const isTimeDisabled = (time) => {
        if (!selectedDate) return true;
        const now = moment();
        const [hours, minutes] = time.split(':').map(Number);
        const combinedDateTime = moment(selectedDate)
            .hour(hours)
            .minute(minutes);
        const isPast = combinedDateTime.isBefore(now);
        const isBooked = availableTimes && !availableTimes.includes(time);
        console.log(`Checking if time ${time} is disabled: isPast=${isPast}, isBooked=${isBooked}`);
        return isPast || isBooked; // Disable nếu giờ đã qua hoặc đã đặt
    };

    if (loading) {
        return <div className="text-center text-muted py-4">Đang tải khung giờ...</div>;
    }

    if (error) {
        return <div className="alert alert-danger text-center py-4">{error}</div>;
    }

    return (
        <div className="time-slot-picker-container">
            {defaultTimeSlots.map((time, index) => {
                const isSelected = selectedTime === time;
                const isDisabled = isTimeDisabled(time);

                return (
                    <button
                        key={index}
                        type="button"
                        className={`time-slot-button ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                        onClick={() => !isDisabled && handleTimeSelect(time)}
                        disabled={isDisabled}
                    >
                        {time}
                    </button>
                );
            })}
        </div>
    );
};

export default TimeSlotPicker;