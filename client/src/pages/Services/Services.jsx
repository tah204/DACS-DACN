import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';
import HeroServices from '../../components/Hero/HeroServices';

const Services = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/categoryservices')
      .then((response) => setServices(response.data))
      .catch((error) => console.error('Error fetching services:', error));

    AOS.init({ duration: 1000 });
  }, []);

  return (
    <>
      {/* Section 1: Giới thiệu */}
      <section className="py-5 border-bottom" style={{ width: '100%', backgroundColor: '#fff' }}>
        <div className="container px-4 px-md-5">
          <div className="row align-items-center gx-5">
            <div className="col-md-6 mb-4 mb-md-0" data-aos="fade-right">
              <div
                style={{
                  height: '100%',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                }}
              >
                <img
                  src="/images/1.jpg"
                  alt="Dịch vụ chăm sóc thú cưng"
                  className="img-fluid w-100 h-100"
                  style={{ objectFit: 'cover', maxHeight: '70%' }}
                  onError={(e) => (e.target.src = '/images/default_service.jpg')}
                />
              </div>
            </div>
            <div className="col-md-6 ps-md-5" data-aos="fade-left">
              <h2 className="fw-bold mb-4" style={{ fontSize: '2.5rem', fontFamily: 'Quicksand', color: '#0d2554' }}>
                Dịch vụ
              </h2>
              <p className="text-muted mb-3" style={{ fontSize: '1.1rem', lineHeight: '1.6', textAlign: 'justify' }}>
                Có một người bạn đồng hành là một niềm vui, và một trách nhiệm quan trọng. Là người có trách nhiệm, bạn muốn thú cưng của mình nhận được tất cả sự chăm sóc và yêu thương mà chúng cần để sống lâu và hạnh phúc. Đó là lý do tại sao sự lựa chọn bác sĩ thú y của bạn là rất quan trọng.
              </p>
              <p className="text-muted" style={{ fontSize: '1.1rem', lineHeight: '1.6', textAlign: 'justify' }}>
                Bạn muốn có một bác sĩ thú y tận tụy để giữ cho thú cưng của bạn khỏe mạnh và hạnh phúc. Một bác sĩ thú y làm việc với bạn không mệt mỏi để đảm bảo sức khỏe toàn diện cho thú cưng của bạn. Và bạn muốn bác sĩ thú y đó làm tốt công việc của mình nhất có thể. Điều đó có nghĩa là họ phải có cơ sở vật chất, công cụ chẩn đoán hạng nhất và các loại thuốc phù hợp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Danh sách dịch vụ */}
      <section className="py-5" style={{ backgroundColor: '#FAF7F1', width: '100%' }}>
        <div className="container px-4 px-md-5">
          <h2 className="fw-bold mb-3 text-center" style={{ fontFamily: 'Quicksand', fontSize: '2.5rem', color: '#0d2554' }}>
            Các dịch vụ
          </h2>
          <p className="text-center mb-4" style={{ fontSize: '1.25rem', color: '#555', fontWeight: '500', fontFamily: 'Quicksand' }}>
            Từ chăm sóc sức khỏe đến làm đẹp, chúng tôi có tất cả!
          </p>
          <div className="row g-4">
            {services.map((service) => (
              <div className="col-md-4" key={service._id}>
                <Link to={`/categoryservices/${service._id}`} className="text-decoration-none">
                  <div className="card service-card border-0 shadow-sm h-100">
                    <div className="service-img-wrapper">
                      <img
                        src={`http://localhost:5000/api/images/${service.image}`}
                        alt={service.name}
                        className="service-img"
                        onError={(e) => (e.target.src = '/images/default_service.jpg')}
                      />
                    </div>
                    <div className="service-card-body">
                      <h5 className="fw-bold mb-2" style={{color: 'white' , fontFamily: 'Quicksand' }}>{service.name}</h5>
                      <p className="mb-3">{service.description || 'Không có mô tả'}</p>
                      <Link
                        to={`/categoryservices/${service._id}`}
                        className="btn p-0 mt-2 fw-semibold"
                        style={{ color: '#ffffff', backgroundColor: 'transparent', border: 'none', fontSize: '1.2rem' }}
                      >
                        →
                      </Link>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Chăm sóc tận tâm */}
      <HeroServices />

    </>
  );
};

export default Services;
