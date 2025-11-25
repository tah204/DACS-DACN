const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Customer', 
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: [true, 'Bình luận không được để trống'],
    },
  },
  {
    timestamps: true,
  }
);

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên bác sĩ là bắt buộc'],
      trim: true,
    },
    specialty: {
      type: String,
      required: [true, 'Chuyên khoa là bắt buộc'],
      trim: true,
    },
    categoryServices: [
      {
        type: Number,
        ref: 'CategoryService', 
        required: true
      }
    ],
    experienceYears: {
      type: Number,
      required: true,
      default: 0,
    },
    image: {
      type: String,
      required: true,
      default: '/images/doctors/default-avatar.jpg',
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    description: {
      type: String,
      required: [true, 'Mô tả ngắn là bắt buộc'],
      trim: true,
    },
    fullDescription: {
      type: String,
      required: [true, 'Mô tả đầy đủ là bắt buộc'],
      trim: true,
    },
    services: {
      type: [String],
      default: [],
    },
    reviews: [reviewSchema], 
  },
  {
    timestamps: true,
  }
);

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;