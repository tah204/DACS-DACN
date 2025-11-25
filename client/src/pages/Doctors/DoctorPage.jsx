import React, { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Doctor.css"; 

const DoctorPage = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 1. LẤY DỮ LIỆU BÁC SĨ (Dùng URL tuyệt đối) ---
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        // Đường dẫn API DATA đồng bộ với News
        const { data } = await axios.get("http://localhost:5000/api/doctors"); 
        setDoctors(data);
        setError(null);
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Lỗi khi tải dữ liệu bác sĩ"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []); 

  const handleClick = (id) => {
    navigate(`/doctors/${id}`);
  };

  // ... (Phần Loading/Error giữ nguyên) ...

  if (loading) {
    return (
      <div className="doctor-container">
        <h1>🩺 Đội Ngũ Bác Sĩ Thú Y</h1>
        <p>Đang tải danh sách bác sĩ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doctor-container">
        <h1>🩺 Đội Ngũ Bác Sĩ Thú Y</h1>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="doctor-container">
      <h1>🩺 Đội Ngũ Bác Sĩ Thú Y</h1>
      <p>Những chuyên gia hàng đầu về chăm sóc sức khỏe thú cưng của bạn</p>

      <div className="doctor-list">
        {doctors.map((doctor) => (
          <div
            key={doctor._id}
            className="doctor-card"
            onClick={() => handleClick(doctor._id)}
          >
            {/* --- 2. TẢI ẢNH (Dùng URL tuyệt đối + tên tệp) --- */}
            <img 
                src={`http://localhost:5000/api/images/${doctor.image}`} 
                alt={doctor.name} 
            />
            {/* ---------------------------------------------------- */}
            <h2>{doctor.name}</h2>
            <p className="specialty">💼 {doctor.specialty}</p>
            <p className="experience">
              ⏱️ {doctor.experienceYears} năm kinh nghiệm
            </p>
            <p className="description">{doctor.description}</p>
            <div className="rating">⭐ {doctor.rating.toFixed(1)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorPage;