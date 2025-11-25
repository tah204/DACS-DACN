const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Pet = require('../models/Pet');
const Customer = require('../models/Customer');
const Doctor = require('../models/Doctors');
const {createPaymentUrl} = require('./paymentVNPayController');
const {createMoMoPayment} = require('./paymentMoMoController');

const getTimeString = (date) => {
  const d = new Date(date);
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}`; 
};

exports.checkAvailability = async (req, res) => {
    try {
        const { checkIn, checkOut } = req.body;
        const service = await Service.findById(req.params.serviceId);

        if (!service || !service.category || service.category !== 3) {
            return res.status(400).json({ message: 'Dịch vụ không hợp lệ hoặc không phải dịch vụ khách sạn.' });
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (isNaN(checkInDate) || isNaN(checkOutDate)) {
            return res.status(400).json({ message: 'Ngày check-in hoặc check-out không hợp lệ.' });
        }

        if (checkOutDate <= checkInDate) {
            return res.status(400).json({ message: 'Ngày check-out phải sau ngày check-in.' });
        }

        const overlappingBookings = await Booking.find({
            serviceId: req.params.serviceId,
            status: { $in: ['pending', 'active', 'completed'] },
            $or: [
                { checkIn: { $lte: checkOutDate }, checkOut: { $gte: checkInDate } },
            ],
        });

        const bookedRooms = overlappingBookings.length;
        const availableRooms = service.totalRooms - bookedRooms;

        if (availableRooms <= 0) {
            return res.status(400).json({ message: 'Không còn phòng trống trong khoảng thời gian đã chọn.' });
        }

        res.json({
            availableRooms,
            totalRooms: service.totalRooms,
            checkIn: checkInDate.toISOString(),
            checkOut: checkOutDate.toISOString(),
        });
    } catch (error) {
        console.error('Error in checkAvailability:', error.message || error);
        res.status(500).json({ message: 'Lỗi khi kiểm tra tính khả dụng.', error: error.message || error });
    }
};

exports.createBooking = async (req, res) => {
    const { bookingDate, serviceId, petId, checkIn, checkOut, subServiceIds, doctorId, notes, paymentMethod } = req.body;

    if (!bookingDate || !serviceId || !petId || !req.user.customerId) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin: bookingDate, serviceId, petId, customerId.' });
    }

    try {
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Dịch vụ không tồn tại.' });
        }

        let finalBookingDate;
        let totalAmount = 0;
        let finalDoctorId = service.category === 1 ? (doctorId || null) : null;

        if (service.category === 3) {
            if (!checkIn || !checkOut) {
                return res.status(400).json({ message: 'Ngày check-in và check-out là bắt buộc cho dịch vụ khách sạn.' });
            }
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            if (isNaN(checkInDate) || isNaN(checkOutDate) || checkOutDate <= checkInDate) {
                return res.status(400).json({ message: 'Ngày check-in hoặc check-out không hợp lệ hoặc check-out phải sau check-in.' });
            }
            finalBookingDate = checkInDate;
            const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            totalAmount = service.price * (daysDiff > 0 ? daysDiff : 1);
            if (subServiceIds && subServiceIds.length > 0) {
                const SubServiceAsService = mongoose.model('Service'); 
                const subServices = await SubServiceAsService.find({ 
                    _id: { $in: subServiceIds },
                    category: 2 
                });

                if (subServices.length !== subServiceIds.length) {
                    return res.status(400).json({ message: 'Một hoặc nhiều dịch vụ phụ không hợp lệ.' });
                }

                const subServiceTotal = subServices.reduce((sum, sub) => sum + sub.price, 0);
                totalAmount += subServiceTotal; 
            }
        } else {
            const bookingDateObj = new Date(bookingDate);
            if (isNaN(bookingDateObj)) {
                return res.status(400).json({ message: 'Ngày đặt không hợp lệ.' });
            }
            console.log('Creating booking with bookingDate:', bookingDateObj.toISOString()); // Debug
            const startOfDay = new Date(bookingDateObj);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(bookingDateObj);
            endOfDay.setHours(23, 59, 59, 999);

            // Kiểm tra khung giờ đã được đặt
            const bookingTimeStr = getTimeString(bookingDateObj);

            // Tìm các booking trong cùng ngày
            const existingBookings = await Booking.find({
                serviceId,
                status: { $in: ['pending', 'active', 'completed'] },
                bookingDate: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            });

            // Kiểm tra trùng giờ chính xác
            const bookedTimes = existingBookings.map(booking => getTimeString(booking.bookingDate));

            if (bookedTimes.includes(bookingTimeStr)) {
                return res.status(400).json({ 
                    message: 'Khung giờ này đã được đặt. Vui lòng chọn khung giờ khác.' 
                });
            }

            finalBookingDate = bookingDateObj;
            totalAmount = service.price;
        }

        if (finalDoctorId) {
            const doctor = await Doctor.findById(finalDoctorId);
            if (!doctor) {
                return res.status(404).json({ message: 'Bác sĩ không tồn tại.' });
            }
        }

        const pet = await Pet.findById(petId);
        if (!pet) {
            return res.status(404).json({ message: 'Thú cưng không tồn tại.' });
        }

        let newBookingData = {
            customerId: req.user.customerId,
            bookingDate: finalBookingDate,
            serviceId,
            petId,
            doctorId: finalDoctorId,
            status: 'pending',
            notes: notes || '',
            totalAmount: totalAmount,
            paymentStatus: 'pending'
        };

        if (service.category === 3) {
            newBookingData.checkIn = new Date(checkIn);
            newBookingData.checkOut = new Date(checkOut);
            newBookingData.subServices = subServiceIds || [];
            const overlappingBookings = await Booking.find({
                serviceId,
                status: { $in: ['pending', 'active', 'completed'] },
                $or: [
                    { checkIn: { $lte: newBookingData.checkOut }, checkOut: { $gte: newBookingData.checkIn } },
                ],
            });

            if (overlappingBookings.length >= service.totalRooms) {
                return res.status(400).json({ message: 'Không còn phòng trống trong khoảng thời gian đã chọn.' });
            }
        }

        const booking = new Booking(newBookingData);
        const newBooking = await booking.save();
        const ipAddress =   req.headers['x-forwarded-for'] || 
                            req.connection.remoteAddress ||
                            req.socket.remoteAddress ||
                            (req.connection.socket ? req.connection.socket.remoteAddress : null);
        // Determine payment method and generate redirect URL
        let paymentUrl = '';
        let responseMessage = '';
        if (paymentMethod === 'momo') {
            const paymentDataMoMo = {
                amount: newBooking.totalAmount,
                bookingId: newBooking._id.toString(),
            };
            paymentUrl = await createMoMoPayment(paymentDataMoMo);
            responseMessage = 'Booking created. Redirecting to MoMo...';
        } else {
            const paymentDataVNPAY = {
                amount: newBooking.totalAmount,
                orderId: newBooking._id.toString(),
                ipAddr: ipAddress,
            };
            paymentUrl = createPaymentUrl(paymentDataVNPAY);
            responseMessage = 'Booking created. Redirecting to VNPAY...';
        }
        res.status(200).json({
            code: '00',
            message: responseMessage,
            data: paymentUrl
        });
    } catch (error) {
        console.error('Error in createBooking:', error.message || error);
        res.status(500).json({ message: 'Lỗi khi tạo booking.', error: error.message || error.toString() });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { customerId: req.user.customerId };
        const bookings = await Booking.find(query)
            .populate('serviceId', 'name price category')
            .populate('petId', 'name type')
            .populate('customerId', 'name phone')
            .populate('subServices', 'name price')
            .populate('doctorId', 'name image specialty');
        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error in getAllBookings:', error.message || error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách booking.', error: error.message || error });
    }
};

exports.updateBooking = async (req, res) => {
    const { bookingDate, serviceId, petId, checkIn, checkOut, subServiceIds, doctorId, status, notes, paymentStatus, paymentMethod, paymentDetails } = req.body;

    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking không tồn tại.' });
        }

        if (subServiceIds !== undefined) {
             // Basic validation: must be an array or null/undefined (handled by `!== undefined`)
            if (!Array.isArray(subServiceIds)) {
                return res.status(400).json({ message: 'Dịch vụ phụ phải là một danh sách (array).' });
            }
            booking.subServices = subServiceIds;
        }

        if (req.user.role !== 'admin' && booking.customerId.toString() !== req.user.customerId) {
            return res.status(403).json({ message: 'Không được phép: Bạn không có quyền cập nhật booking này.' });
        }

        let newBookingDate = booking.bookingDate;
        if (bookingDate) {
            const bookingDateObj = new Date(bookingDate);
            if (isNaN(bookingDateObj)) {
                return res.status(400).json({ message: 'Ngày đặt không hợp lệ.' });
            }
            newBookingDate = bookingDateObj;
        }
        booking.bookingDate = newBookingDate;

        if (serviceId) {
            const service = await Service.findById(serviceId);
            if (!service) return res.status(404).json({ message: 'Dịch vụ không tồn tại.' });
            booking.serviceId = serviceId;
        }
        if (petId) {
            const pet = await Pet.findById(petId);
            if (!pet) return res.status(404).json({ message: 'Thú cưng không tồn tại.' });
            if (req.user.role !== 'admin' && pet.customerId.toString() !== req.user.customerId) {
                return res.status(403).json({ message: 'Không được phép: Bạn không sở hữu thú cưng này.' });
            }
            booking.petId = petId;
        }
        if (doctorId !== undefined) { 
            booking.doctorId = doctorId;
        }
        if (status) {
            if (!['pending', 'active', 'completed', 'canceled'].includes(status)) {
                return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
            }
            if (status === 'completed' && booking.status !== 'active') {
                return res.status(400).json({ message: 'Đơn phải được xác nhận (active) trước khi hoàn thành (completed).' });
            }
            booking.status = status;
        }
        if (notes !== undefined) {
            booking.notes = notes;
        }

        if (paymentStatus) {
            if (!['pending', 'success', 'failed'].includes(paymentStatus)) {
                return res.status(400).json({ message: 'Trạng thái thanh toán không hợp lệ.' });
            }
            booking.paymentStatus = paymentStatus;
        }

        if (paymentMethod) {
            booking.paymentMethod = paymentMethod;
        }

        if (paymentDetails) {
            // Ghi đè hoặc gộp thông tin thanh toán
            booking.paymentDetails = paymentDetails;
        }

        const currentService = await Service.findById(serviceId || booking.serviceId);
        if (!currentService) {
            return res.status(404).json({ message: 'Dịch vụ không tồn tại sau khi cập nhật serviceId.' });
        }

        if (currentService.category === 1) { 
            if (doctorId !== undefined) { 
                if (doctorId && doctorId !== 'null') {
                    const doctor = await Doctor.findById(doctorId);
                    if (!doctor) {
                        return res.status(404).json({ message: 'Bác sĩ không tồn tại.' });
                    }
                    booking.doctorId = doctorId;
                } else {
                    booking.doctorId = null; 
                }
            }
        } else {
            // Nếu dịch vụ KHÔNG phải là Category 1, đảm bảo doctorId luôn là null
            booking.doctorId = null;
        }

        if (currentService.category === 3) {
            const newCheckIn = checkIn ? new Date(checkIn) : booking.checkIn;
            const newCheckOut = checkOut ? new Date(checkOut) : booking.checkOut;

            if (!newCheckIn || !newCheckOut || newCheckOut <= newCheckIn) {
                return res.status(400).json({ message: 'Ngày check-in và check-out là bắt buộc và hợp lệ cho dịch vụ khách sạn.' });
            }

            const overlappingBookings = await Booking.find({
                serviceId: currentService._id,
                status: { $in: ['pending', 'active', 'completed'] },
                _id: { $ne: booking._id },
                $or: [
                    { checkIn: { $lte: newCheckOut }, checkOut: { $gte: newCheckIn } },
                ],
            });

            if (overlappingBookings.length >= currentService.totalRooms) {
                return res.status(400).json({ message: 'Không còn phòng trống trong khoảng thời gian đã chọn.' });
            }

            booking.checkIn = newCheckIn;
            booking.checkOut = newCheckOut;
            if (bookingDate === undefined) {
                booking.bookingDate = newCheckIn;
            }
            const finalSubServiceIds = subServiceIds !== undefined ? subServiceIds : booking.subServices;
            const timeDiff = newCheckOut.getTime() - newCheckIn.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            let newTotalAmount = currentService.price * (daysDiff > 0 ? daysDiff : 1);

            if (finalSubServiceIds && finalSubServiceIds.length > 0) {
                const SubService = mongoose.model('Service');
                const subServices = await SubService.find({ _id: { $in: finalSubServiceIds }, category: 2 });
                if (subServices.length !== finalSubServiceIds.length) {
                    return res.status(400).json({ message: 'Một hoặc nhiều dịch vụ phụ (Category 2) không hợp lệ.' });
                }
                const subServiceTotal = subServices.reduce((sum, sub) => sum + sub.price, 0);
                newTotalAmount += subServiceTotal;
            }

            booking.totalAmount = newTotalAmount;
        } else {
            booking.checkIn = undefined;
            booking.checkOut = undefined;
            // Backfill totalAmount if missing for non-hotel services
            if (!booking.totalAmount || Number.isNaN(Number(booking.totalAmount))) {
                booking.totalAmount = currentService.price;
            }
        }

        await booking.save(); // Lưu thay đổi
        // Tìm lại document và populate
        const updatedBooking = await Booking.findById(booking._id)
            .populate('serviceId', 'name price category')
            .populate('petId', 'name type')
            .populate('customerId', 'name phone')
            .populate('doctorId', 'name image specialty');

        res.status(200).json(updatedBooking);
    } catch (error) {
        console.error('Error in updateBooking:', error.message || error);
        res.status(500).json({ message: 'Lỗi khi cập nhật booking.', error: error.message || error });
    }
};

exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking không tồn tại.' });
        }

        if (req.user.role !== 'admin' && booking.customerId.toString() !== req.user.customerId) {
            return res.status(403).json({ message: 'Không được phép: Bạn không có quyền xóa booking này.' });
        }

        await booking.deleteOne();
        res.status(200).json({ message: 'Booking đã được xóa.' });
    } catch (error) {
        console.error('Error in deleteBooking:', error.message || error);
        res.status(500).json({ message: 'Lỗi khi xóa booking.', error: error.message || error });
    }
};

exports.getAvailableTimes = async (req, res) => {
    try {
        const { date, doctorId } = req.query;
        const { serviceId } = req.params;

        if (!date) {
            return res.status(400).json({ message: 'Vui lòng cung cấp ngày.' });
        }

        const selectedDate = new Date(date);
        if (isNaN(selectedDate)) {
            return res.status(400).json({ message: 'Ngày không hợp lệ.' });
        }

        const service = await Service.findById(serviceId);
        if (!service || service.category === 3) {
            return res.status(400).json({ message: 'Dịch vụ không hợp lệ hoặc là dịch vụ khách sạn.' });
        }

        const availableTimeSlots = [
            '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00'
        ];

        const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

        // const bookings = await Booking.find({
        //     serviceId,
        //     status: { $in: ['pending', 'active', 'completed'] },
        //     bookingDate: {
        //         $gte: startOfDay,
        //         $lte: endOfDay
        //     }
        // });

        // === XÂY DỰNG TRUY VẤN ĐỘNG (ĐÃ SỬA) ===
        const query = {
            serviceId,
            status: { $in: ['pending', 'active', 'completed'] },
            bookingDate: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        };

        if (service.category === 1) { 
            // Nếu là dịch vụ Y tế/Khám bệnh
            const requestedDoctorId = doctorId && doctorId.toLowerCase() !== 'null' ? doctorId : null;

            if (requestedDoctorId) {
                // Trường hợp 1: Người dùng chọn Bác sĩ cụ thể => Lọc lịch của Bác sĩ đó.
                const doctor = await Doctor.findById(requestedDoctorId);
                if (!doctor) {
                    return res.status(404).json({ message: 'Không tìm thấy bác sĩ' });
                }
                query.doctorId = requestedDoctorId; 
            } else {
                // Trường hợp 2: Người dùng KHÔNG chọn Bác sĩ (Khám chung/Hẹn giờ chung) => Lọc lịch chung.
                // Điều kiện này cần khớp với logic khi tạo booking không có doctorId
                query.doctorId = null; 
            }
        } else {
            // Đối với các dịch vụ hẹn giờ khác (Category 2: Grooming, etc.), 
            // có thể coi như lịch chung (không cần doctorId).
            query.doctorId = null;
        }

        // === THỰC THI TRUY VẤN VỚI QUERY ĐÃ XÂY DỰNG ===
        const bookings = await Booking.find(query);

        console.log('Bookings found for', selectedDate.toISOString(), ':', bookings);

        const bookedTimes = bookings.map(booking => getTimeString(booking.bookingDate));

        const availableTimes = availableTimeSlots.filter(
            time => !bookedTimes.includes(time)
        );

        console.log('Available times:', availableTimes);

        res.json({ availableTimes });
    } catch (error) {
        console.error('Error in getAvailableTimes:', error.message || error);
        res.status(500).json({ message: 'Lỗi khi lấy khung giờ trống.', error: error.message || error });
    }
};

module.exports = {
    checkAvailability: exports.checkAvailability,
    createBooking: exports.createBooking,
    getAllBookings: exports.getAllBookings,
    updateBooking: exports.updateBooking,
    deleteBooking: exports.deleteBooking,
    getAvailableTimes: exports.getAvailableTimes
};