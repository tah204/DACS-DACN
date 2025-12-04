import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import HeroIntro from '../../components/Hero/HeroIntro';
import { motion } from 'framer-motion';
import NewsSlider from '../../components/Bookings/NewsSlider';
import '../../App.css'; 

const Home = () => {
  const [featuredNews, setFeaturedNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [consultation, setConsultation] = useState({ petName: '', phone: '' });

  useEffect(() => {
    axios.get('http://localhost:5000/api/news')
      .then((res) => {
        const sortedNews = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setFeaturedNews(sortedNews);
      })
      .catch((err) => console.error('Error fetching news:', err));

    axios.get('http://localhost:5000/api/categoryservices')
      .then((res) => {
        const shuffled = res.data.sort(() => 0.5 - Math.random()).slice(0, 3);
        setCategories(shuffled);
      })
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConsultation((prev) => ({ ...prev, [name]: value }));
  };

  const handleConsultationSubmit = (e) => {
    e.preventDefault();
    console.log('Consultation submitted:', consultation);
    setConsultation({ petName: '', phone: '' });
  };

  return (
    <div>
      <HeroIntro />

      {/* Giới thiệu */}
      <section className="py-5" id="gioi-thieu" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-6">
              <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <h2 className="mb-4 intro-title">Giới thiệu</h2>
                <p className="text-muted mb-3 intro-text">
                  Thú cưng là một phần quan trọng như một thành viên gia đình...
                </p>
                <p className="text-muted mb-3 intro-text">
                  Chúng tôi thành lập NekoKin để đáp ứng nhu cầu...
                </p>
                <Link to="/about" className="btn btn-red" onClick={handleLinkClick}>Chi tiết</Link>
              </motion.div>
            </div>
            <div className="col-12 col-lg-6 text-center">
              <motion.img
                src="/images/thú-cưng-và-bs.jpg"
                alt="Thú cưng"
                className="img-fluid rounded shadow"
                style={{ maxHeight: '400px', objectFit: 'cover' }}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Danh mục dịch vụ */}
      <motion.section className="py-5" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <div className="container">
          <h2 className="text-center mb-5 intro-title">Danh mục dịch vụ</h2>
          <div className="row g-4 justify-content-center">
            {categories.length > 0 ? (
              categories.map((category) => (
                <div key={category._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <Link
                    to={`/categoryservices/${category._id}`} 
                    className="text-decoration-none text-dark"
                    onClick={handleLinkClick}
                  >
                    <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }} className="card h-100 shadow-sm border-0">
                      <img
                        src={`http://localhost:5000/api/images/${category.image}`}
                        className="card-img-top img-fluid card-img-custom"
                        alt={category.name}
                        onError={(e) => (e.target.src = '/images/default_category.jpg')}
                      />
                      <div className="card-body">
                        <h3 className="card-title card-title-center">{category.name}</h3>
                      </div>
                    </motion.div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-12 text-center">
                <p className="text-muted">Không có danh mục nào.</p>
              </div>
            )}
          </div>
          <div className="text-center mt-4">
            <Link to="/services" onClick={handleLinkClick} className="btn btn-red px-4 py-2">Tìm hiểu thêm</Link>
          </div>
        </div>
      </motion.section>

      {/* Tin tức */}
      <NewsSlider featuredNews={featuredNews} />
    </div>
  );
};

export default Home;
