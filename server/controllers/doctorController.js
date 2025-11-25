const Doctor = require('../models/Doctors');
const Customer = require('../models/Customer');

// @desc    Tạo mới một bác sĩ
// @route   POST /api/doctors
exports.createDoctor = async (req, res) => {
  try {
    // Lấy tất cả các trường mới từ req.body
    const {
      name,
      specialty,
      categoryServices,
      experienceYears,
      image,
      description,
      fullDescription,
      services,
    } = req.body;

    // Tạo bác sĩ mới (rating và numReviews sẽ mặc định là 0)
    const doctor = new Doctor({
      name,
      specialty,
      categoryServices,
      experienceYears,
      image,
      description,
      fullDescription,
      services,
      // rating, numReviews, user (người tạo) sẽ được quản lý riêng
      // Ví dụ: rating sẽ được cập nhật khi có review
    });

    const createdDoctor = await doctor.save();
    res.status(201).json(createdDoctor);
  } catch (error) {
    res.status(400).json({ message: 'Tạo bác sĩ thất bại', error: error.message });
  }
};

// ... (Hàm getAllDoctors và getDoctorById không cần thay đổi) ...
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).populate('categoryServices', 'name');
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('categoryServices', 'name');
    if (doctor) {
      res.status(200).json(doctor);
    } else {
      res.status(404).json({ message: 'Không tìm thấy bác sĩ' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};


// @desc    Cập nhật thông tin bác sĩ
// @route   PUT /api/doctors/:id
exports.updateDoctor = async (req, res) => {
  try {
    const {
      name,
      specialty,
      categoryServices,
      experienceYears,
      image,
      description,
      fullDescription,
      services,
    } = req.body;

    const doctor = await Doctor.findById(req.params.id);

    if (doctor) {
      // Cập nhật các trường
      doctor.name = name || doctor.name;
      doctor.specialty = specialty || doctor.specialty;
      if (categoryServices) {
        doctor.categoryServices = categoryServices; 
      }
      doctor.experienceYears = experienceYears ?? doctor.experienceYears; // Dùng ?? để cho phép cập nhật thành 0
      doctor.image = image || doctor.image;
      doctor.description = description || doctor.description;
      doctor.fullDescription = fullDescription || doctor.fullDescription;
      doctor.services = services || doctor.services;
      // Không cho phép cập nhật rating/numReviews trực tiếp qua API này

      const updatedDoctor = await doctor.save();
      res.status(200).json(updatedDoctor);
    } else {
      res.status(404).json({ message: 'Không tìm thấy bác sĩ' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Cập nhật thất bại', error: error.message });
  }
};

// @desc    Xóa một bác sĩ
// @route   DELETE /admin/doctors/:id
// @access  Private (Admin)
exports.deleteDoctor = async (req, res) => {
    try {
      const doctor = await Doctor.findById(req.params.id);
  
      if (doctor) {
        // SAII (Cũ): await doctor.remove();
        // ĐÚNG (Mới):
        await doctor.deleteOne();
  
        res.status(200).json({ message: 'Bác sĩ đã được xóa' });
      } else {
        res.status(404).json({ message: 'Không tìm thấy bác sĩ' });
      }
    } catch (error) {
      // Chúng ta trả về error.message để rõ ràng hơn
      res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
  };


  exports.createDoctorReview = async (req, res) => {
    const { rating, comment } = req.body;
    const doctorId = req.params.id;
  
    // 1. Kiểm tra xem có nội dung rating và comment không
    if (!rating || !comment) {
      return res.status(400).json({ message: 'Vui lòng nhập rating và bình luận' });
    }
  
    try {
      // 2. Lấy thông tin bác sĩ
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({ message: 'Không tìm thấy bác sĩ' });
      }
  
      // 3. Lấy thông tin người dùng từ req.user (được cung cấp bởi authMiddleware)
      //    req.user.id là ID của (User/Auth), còn req.user.customerId là ID của (Customer)
      const customer = await Customer.findById(req.user.customerId);
      if (!customer) {
        return res.status(404).json({ message: 'Không tìm thấy thông tin customer' });
      }
  
      // 4. Kiểm tra xem người dùng này đã đánh giá bác sĩ này chưa
      const alreadyReviewed = doctor.reviews.find(
        (r) => r.user.toString() === customer._id.toString()
      );
  
      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Bạn đã đánh giá bác sĩ này rồi' });
      }
  
      // 5. (Nâng cao): Bạn có thể kiểm tra xem customer này đã
      //    từng "hoàn thành" một lịch hẹn với bác sĩ này chưa.
      //    (Chúng ta sẽ bỏ qua bước này cho đơn giản, nhưng đây là logic đúng)
  
      // 6. Tạo đối tượng review mới
      const review = {
        user: customer._id,
        name: customer.name, // Lấy tên từ model Customer
        rating: Number(rating),
        comment: comment,
      };
  
      // 7. Thêm review vào mảng reviews của bác sĩ
      doctor.reviews.push(review);
  
      // 8. Cập nhật lại tổng số review và điểm trung bình
      doctor.numReviews = doctor.reviews.length;
      doctor.rating =
        doctor.reviews.reduce((acc, item) => item.rating + acc, 0) /
        doctor.reviews.length;
  
      // 9. Lưu lại vào DB
      await doctor.save();
  
      res.status(201).json({ message: 'Đánh giá đã được thêm' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
  };