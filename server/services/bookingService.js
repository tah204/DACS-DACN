// services/bookingService.js
const Booking = require('../models/Booking');
const Service = require('../models/Service');

class BookingService {
  static generateBookingCode() {
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const random = Math.floor(100000 + Math.random() * 900000);
    return `BOOK-${date}-${random}`;
  }

  static roundToSlot(date) {
    const ms = 30 * 60 * 1000;
    return new Date(Math.floor(date.getTime() / ms) * ms);
  }

  static async checkRoomAvailability(serviceId, checkIn, checkOut, excludeBookingId = null) {
    const query = {
      serviceId,
      status: { $in: ['pending', 'active', 'completed'] },
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn },
    };
    if (excludeBookingId) query._id = { $ne: excludeBookingId };

    const count = await Booking.countDocuments(query);
    const service = await Service.findById(serviceId);
    return count < service.totalRooms;
  }

  static async createHotelBooking(data) {
    const { serviceId, checkIn: ci, checkOut: co, subServiceIds = [] } = data;
    const checkIn = new Date(ci);
    const checkOut = new Date(co);

    if (checkOut <= checkIn) throw new Error('Check-out phải sau check-in');

    const service = await Service.findById(serviceId);
    if (!service || service.category !== 3) throw new Error('Dịch vụ không phải khách sạn');

    const available = await this.checkRoomAvailability(serviceId, checkIn, checkOut);
    if (!available) throw new Error('Không còn phòng trống');

    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const stayDays = nights >= 1 ? nights : 1;
    let totalAmount = service.price * stayDays;

    if (subServiceIds.length > 0) {
      const subs = await Service.find({ _id: { $in: subServiceIds }, category: 2 });
      if (subs.length !== subServiceIds.length) throw new Error('Dịch vụ phụ không hợp lệ');
      totalAmount += subs.reduce((sum, s) => sum + s.price, 0);
    }

    return {
      customerId: data.customerId,
      serviceId,
      petId: data.petId,
      bookingDate: checkIn,
      checkIn,
      checkOut,
      subServices: subServiceIds,
      notes: data.notes,
      totalAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === 'cod' ? 'pending' : 'pending',
      status: 'pending',
      bookingCode: this.generateBookingCode(),
    };
  }

  static async createAppointmentBooking(data) {
    const { serviceId, bookingDate: bd, doctorId } = data;
    const bookingDate = this.roundToSlot(new Date(bd));
    const service = await Service.findById(serviceId);

    if (!service || service.category === 3) throw new Error('Dịch vụ không hợp lệ');

    const startOfDay = new Date(bookingDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(bookingDate.setHours(23, 59, 59, 999));
    const slotStr = bookingDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const existing = await Booking.findOne({
      serviceId,
      status: { $in: ['pending', 'active', 'completed'] },
      bookingDate: { $gte: startOfDay, $lte: endOfDay },
      $expr: { $eq: [{ $dateToString: { format: '%H:%M', date: '$bookingDate' } }, slotStr] },
      ...(service.category === 1 ? { doctorId: doctorId || null } : { doctorId: null }),
    });

    if (existing) throw new Error('Khung giờ này đã được đặt');

    return {
      customerId: data.customerId,
      serviceId,
      petId: data.petId,
      bookingDate,
      doctorId: service.category === 1 ? doctorId || null : null,
      notes: data.notes,
      totalAmount: service.price,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === 'cod' ? 'pending' : 'pending',
      status: 'pending',
      bookingCode: this.generateBookingCode(),
    };
  }
}

module.exports = BookingService;