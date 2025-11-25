const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true,
  },
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true,
    index: true,
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
    index: true,
  },
  subServices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
  }],
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    default: null,
  },
  bookingDate: {
    type: Date,
    required: true,
  },
  checkIn: { type: Date },
  checkOut: { type: Date },

  notes: { type: String, default: '' },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'canceled'],
    default: 'pending',
    index: true,
  },

  totalAmount: {
    type: Number,
    required: [true, 'Tổng số tiền là bắt buộc'],
    min: [0, 'Số tiền không được âm'],
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['momo', 'vnpay', 'paypal', 'cod'],
    default: 'cod',
  },
  paymentDetails: {
    type: Object,
    default: {},
  },
}, {
  timestamps: true, // tự động tạo createdAt & updatedAt → ĐÃ XÓA 2 field thủ công
});

// ==================== INDEXES QUAN TRỌNG ====================
bookingSchema.index({ serviceId: 1, bookingDate: 1 });
bookingSchema.index({ serviceId: 1, checkIn: 1, checkOut: -1 });
bookingSchema.index({ status: 1, bookingDate: 1 });
bookingSchema.index({ customerId: 1, createdAt: -1 });
bookingSchema.index({ doctorId: 1, bookingDate: 1 });

// ==================== MIDDLEWARE ====================
bookingSchema.pre('save', async function (next) {
  if (this.checkIn && this.checkOut && this.checkOut <= this.checkIn) {
    return next(new Error('Ngày check-out phải sau ngày check-in'));
  }

  if (this.isNew || this.isModified('petId') || this.isModified('customerId')) {
    try {
      const [customer, pet] = await Promise.all([
        mongoose.model('Customer').findById(this.customerId).lean(),
        mongoose.model('Pet').findById(this.petId).lean(),
      ]);

      if (!customer) return next(new Error('Khách hàng không tồn tại'));
      if (!pet) return next(new Error('Thú cưng không tồn tại'));
      if (pet.customerId.toString() !== this.customerId.toString()) {
        return next(new Error('Thú cưng không thuộc về khách hàng này'));
      }
    } catch (err) {
      return next(err);
    }
  }

  if (this.isModified('status')) {
    const oldStatus = this._originalStatus || 'pending';
    const allowedTransitions = {
      pending: ['confirmed', 'canceled'],
      confirmed: ['active', 'canceled'],
      active: ['completed'],
      completed: [],
      canceled: [],
    };

    if (oldStatus !== this.status && !allowedTransitions[oldStatus]?.includes(this.status)) {
      return next(new Error(`Không thể chuyển từ ${oldStatus} sang ${this.status}`));
    }
  }

  next();
});

bookingSchema.post('init', function () {
  this._originalStatus = this.status;
});

module.exports = mongoose.model('Booking', bookingSchema);