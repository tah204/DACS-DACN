import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DoctorManagement.css"; // <-- 1. Đã thêm import CSS

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(null); // Bác sĩ đang chỉnh sửa
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    experienceYears: 0,
    image: "",
    description: "",
    fullDescription: "",
    services: "", // Dùng chuỗi, sau đó split
  });

  // Lấy token từ localStorage (Dựa trên logic của bạn)
  const getToken = () => {
    const userInfo = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    // Giả định admin role được lưu trong 'user' object
    if (userInfo && userInfo.role === 'admin' && token) {
      return token;
    }
    return null;
  };
  
  // Fetch tất cả bác sĩ (API public)
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/doctors"); // Dùng API public để fetch list
      setDoctors(data);
      setError(null);
    } catch (err) {
      setError("Lỗi khi tải danh sách bác sĩ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Xử lý thay đổi form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Mở modal (Thêm mới)
  const handleAdd = () => {
    setCurrentDoctor(null);
    setFormData({
      name: "",
      specialty: "",
      experienceYears: 0,
      image: "",
      description: "",
      fullDescription: "",
      services: "",
    });
    setIsModalOpen(true);
  };

  // Mở modal (Chỉnh sửa)
  const handleEdit = (doctor) => {
    setCurrentDoctor(doctor);
    setFormData({
      ...doctor,
      services: doctor.services.join(", "), // Join mảng thành chuỗi
    });
    setIsModalOpen(true);
  };

  // Xử lý lưu (Thêm mới hoặc Cập nhật)
  const handleSave = async (e) => {
    e.preventDefault();
    
    const token = getToken();
    if (!token) {
        alert("Không có quyền Admin hoặc token không hợp lệ!");
        return;
    }
    
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const dataToSave = {
      ...formData,
      services: formData.services.split(",").map((s) => s.trim()).filter(s => s), // Tách chuỗi thành mảng (loại bỏ chuỗi rỗng)
      experienceYears: Number(formData.experienceYears)
    };

    try {
      if (currentDoctor) {
        // Cập nhật (PUT)
        await axios.put(
          `/admin/doctors/${currentDoctor._id}`,
          dataToSave,
          config
        );
      } else {
        // Thêm mới (POST)
        await axios.post("/admin/doctors", dataToSave, config);
      }
      fetchDoctors(); // Tải lại danh sách
      setIsModalOpen(false); // Đóng modal
    } catch (err) {
      alert("Lỗi khi lưu bác sĩ: " + (err.response?.data?.message || err.message));
    }
  };

  // Mở modal (Xác nhận xóa)
  const handleDelete = (doctor) => {
    setCurrentDoctor(doctor);
    setIsDeleteModalOpen(true);
  };

  // Xử lý xác nhận xóa
  const confirmDelete = async () => {
    const token = getToken();
    if (!token) {
        alert("Không có quyền Admin hoặc token không hợp lệ!");
        return;
    }
     const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      await axios.delete(`/admin/doctors/${currentDoctor._id}`, config);
      fetchDoctors(); // Tải lại danh sách
      setIsDeleteModalOpen(false);
      setCurrentDoctor(null);
    } catch (err) {
      alert("Lỗi khi xóa bác sĩ: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="doctor-management">
      <div className="dm-header">
        <h1>Quản lý Bác sĩ ({doctors.length})</h1>
        <button onClick={handleAdd} className="dm-btn-add">
          Thêm Bác sĩ
        </button>
      </div>

      {/* Bảng danh sách bác sĩ */}
      <div className="dm-table-wrapper">
        <table className="dm-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên</th>
              <th>Chuyên khoa</th>
              <th>Kinh nghiệm</th>
              <th>Đánh giá</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doc) => (
              <tr key={doc._id}>
                <td>
                  <img
                    src={doc.image}
                    alt={doc.name}
                    className="doctor-image"
                    onError={(e) => { e.target.src = 'https://placehold.co/40x40/cccccc/ffffff?text=Img'; }} // Ảnh dự phòng
                  />
                </td>
                <td>{doc.name}</td>
                <td>{doc.specialty}</td>
                <td>{doc.experienceYears} năm</td>
                <td>
                  {doc.rating.toFixed(1)} ⭐ ({doc.numReviews})
                </td>
                <td className="dm-actions">
                  <button onClick={() => handleEdit(doc)} className="dm-btn-edit">
                    Sửa
                  </button>
                  <button onClick={() => handleDelete(doc)} className="dm-btn-delete">
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="dm-modal-overlay">
          <div className="dm-modal-content">
            <div className="dm-modal-header">
              <h2>{currentDoctor ? "Chỉnh sửa Bác sĩ" : "Thêm Bác sĩ mới"}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="dm-modal-close"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSave} className="dm-form">
              <div className="dm-form-group">
                <label>Tên Bác sĩ</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="dm-form-group">
                <label>Chuyên khoa</label>
                <input
                  type="text"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="dm-form-group">
                <label>Số năm kinh nghiệm</label>
                <input
                  type="number"
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  required
                  min="0"
                />
              </div>
              <div className="dm-form-group">
                <label>Link Ảnh (URL)</label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="/images/doctors/ten-anh.jpg"
                  required
                />
              </div>
              <div className="dm-form-group">
                <label>Mô tả ngắn</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                ></textarea>
              </div>
              <div className="dm-form-group">
                <label>Mô tả đầy đủ</label>
                <textarea
                  name="fullDescription"
                  value={formData.fullDescription}
                  onChange={handleChange}
                  rows="5"
                ></textarea>
              </div>
              <div className="dm-form-group">
                <label>Dịch vụ (Ngăn cách bởi dấu phẩy)</label>
                <input
                  type="text"
                  name="services"
                  value={formData.services}
                  onChange={handleChange}
                  placeholder="Khám tổng quát, Chăm sóc da, ..."
                />
              </div>
              <div className="dm-form-actions">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="dm-btn-cancel"
                >
                  Hủy
                </button>
                <button type="submit" className="dm-btn-save">
                  Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác nhận Xóa */}
      {isDeleteModalOpen && (
        <div className="dm-modal-overlay">
          <div className="dm-modal-content dm-delete-confirm">
            <h2>Xác nhận Xóa</h2>
            <p>
              Bạn có chắc chắn muốn xóa bác sĩ{" "}
              <strong>{currentDoctor?.name}</strong>?
            </p>
            <div className="dm-form-actions">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="dm-btn-cancel"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="dm-btn-delete"
              >
                Xác nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorManagement;