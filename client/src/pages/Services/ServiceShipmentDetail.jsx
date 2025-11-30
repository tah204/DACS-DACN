import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ServiceShipmentDetail = () => {
    const { id: categoryId } = useParams();
    const navigate = useNavigate();
    
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Hình ảnh gallery (giữ nguyên)
    const galleryImages = [
        "/images/ship-pet1.jpg",
        "/images/ship-pet2.jpg",
        "/images/ship-pet3.jpg",
        "/images/ship-pet4.jpg",
        "/images/ship-pet5.jpg",
        "/images/ship-pet6.jpg",
        "/images/ship-pet7.jpg",
        "/images/ship-pet8.jpg"
    ];

    useEffect(() => {
        const fetchCategoryDetails = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(`http://localhost:5000/api/categoryservices/${categoryId}`);
                setCategory(response.data);
            } catch (err) {
                console.error('Error fetching category:', err);
                setError('Không thể tải thông tin dịch vụ vận chuyển.');
            } finally {
                setLoading(false);
            }
        };
        if (categoryId) fetchCategoryDetails();
    }, [categoryId]);

    const handleBookingClick = () => {
        navigate('/shipment');
    };

    if (loading) {
        return (
            <div className="text-center py-5 my-5">
                <div className="spinner-border" style={{ color: '#8B0000' }} role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger text-center">
                    {error || 'Không tìm thấy dịch vụ vận chuyển này.'}
                </div>
            </div>
        );
    }

    const settings = {
        dots: true,
        infinite: true,
        speed: 600,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        arrows: true,
        className: "shipment-slider"
    };

    return (
        <>
            {/* Hero Section - ĐỒNG BỘ MÀU & FONT */}
            <section className="text-white py-5" style={{ background: 'linear-gradient(135deg, #8B0000, #A52A2A)' }}>
                <div className="container py-5">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <h1 className="display-4 fw-bold mb-4" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                                Vận Chuyển Thú Cưng An Toàn
                            </h1>
                            <p className="lead mb-5" style={{ fontFamily: 'Quicksand, sans-serif', fontSize: '1.25rem', lineHeight: '1.7' }}>
                                Dịch vụ vận chuyển thú cưng chuyên nghiệp, an toàn tuyệt đối với lồng chuyên dụng, 
                                điều hòa nhiệt độ, theo dõi hành trình realtime và đội ngũ chăm sóc tận tâm.
                            </p>
                            <button 
                                onClick={handleBookingClick} 
                                className="btn btn-lg fw-bold px-5 py-3 rounded-pill shadow-lg"
                                style={{ 
                                    background: 'linear-gradient(135deg, #DAA520, #B8860B)', 
                                    color: 'white', 
                                    fontFamily: 'Quicksand, sans-serif',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    transition: 'all 0.4s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.transform = 'translateY(-4px)'}
                                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                            >
                                Đặt Vận Chuyển Ngay
                            </button>
                        </div>
                        <div className="col-lg-6 text-center">
                            <img 
                                src="/images/shipping-hero-dogcat.png" 
                                alt="Vận chuyển thú cưng" 
                                className="img-fluid rounded-4 shadow-lg"
                                style={{ maxHeight: '420px', border: '8px solid rgba(255,255,255,0.2)' }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features - Icon Cards ĐỒNG BỘ HOÀN TOÀN */}
            <section className="py-5" style={{ background: 'linear-gradient(145deg, #FAF7F1, #FDFAF5)' }}>
                <div className="container py-4">
                    <div className="row g-5">
                        {[
                            { icon: "fas fa-shield-alt", title: "An toàn tuyệt đối", desc: "Lồng vận chuyển đạt chuẩn hàng không IATA" },
                            { icon: "fas fa-car", title: "Xe chuyên dụng", desc: "Điều hòa riêng, chống sốc, êm ái" },
                            { icon: "fas fa-map-marker-alt", title: "Theo dõi realtime", desc: "Biết chính xác bé đang ở đâu mọi lúc" },
                            { icon: "fas fa-heart", title: "Chăm sóc trên đường", desc: "Có nhân viên đồng hành, cho ăn uống đúng giờ" },
                            { icon: "fas fa-clock", title: "Giao nhận đúng giờ", desc: "Cam kết đúng khung giờ đã hẹn" },
                            { icon: "fas fa-headset", title: "Hỗ trợ 24/7", desc: "Luôn sẵn sàng giải đáp mọi thắc mắc" }
                        ].map((item, idx) => (
                            <div key={idx} className="col-md-4">
                                <div 
                                    className="text-center p-4 rounded-4 h-100 transition-all"
                                    style={{
                                        background: '#FFFFFF',
                                        border: '2px solid rgba(139,0,0,0.06)',
                                        boxShadow: '0 10px 30px rgba(139,0,0,0.08)',
                                        fontFamily: 'Quicksand, sans-serif',
                                        transition: 'all 0.4s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-10px)';
                                        e.currentTarget.style.box_shadow = '0 20px 40px rgba(139,0,0,0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.box_shadow = '0 10px 30px rgba(139,0,0,0.08)';
                                    }}
                                >
                                    <i className={`${item.icon} fa-3x mb-4`} style={{ color: '#8B0000' }}></i>
                                    <h5 className="fw-bold mb-3" style={{ color: '#2D1B1B' }}>{item.title}</h5>
                                    <p className="text-muted small" style={{ color: '#6B5E4F' }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Image Gallery Slider - ĐẸP & COMPACT */}
            <section className="py-5 bg-white">
                <div className="container">
                    <h2 className="text-center mb-5 fw-bold" style={{ 
                        fontFamily: 'Quicksand, sans-serif', 
                        fontSize: '2.2rem',
                        background: 'linear-gradient(135deg, #8B0000, #A52A2A)',
                        WebkitBackgroundClip: 'text',
		                WebkitTextFillColor: 'transparent',
                        position: 'relative'
                    }}>
                        Hành trình yêu thương của các bé
                        <div style={{ 
                            content: '',
                            position: 'absolute',
                            bottom: '-12px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '80px',
                            height: '4px',
                            background: 'linear-gradient(90deg, #8B0000, #A52A2A)',
                            borderRadius: '2px'
                        }}></div>
                    </h2>
                    <Slider {...settings}>
                        {[0, 1  ].map((slideIndex) => (
                            <div key={slideIndex}>
                                <div className="row g-3">
                                    {galleryImages.slice(slideIndex * 4, slideIndex * 4 + 4).map((img, i) => (
                                        <div key={i} className="col-6 col-md-3">
                                            <img 
                                                src={img} 
                                                alt={`Thú cưng được vận chuyển ${i + 1}`}
                                                className="img-fluid rounded-4 shadow"
                                                style={{ 
                                                    height: '220px', 
                                                    objectFit: 'cover',
                                                    border: '3px solid #FAF7F1',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            </section>

            {/* CTA Bottom - ĐỒNG BỘ MÀU VÀNG & ĐỎ */}
            <section className="py-5" style={{ background: 'linear-gradient(135deg, #FFF8E1, #FEF3C7)' }}>
                <div className="container text-center py-5">
                    <h2 className="mb-4 fw-bold" style={{ fontFamily: 'Quicksand, sans-serif', fontSize: '2.5rem', color: '#2D1B1B' }}>
                        Sẵn sàng đưa bé về nhà mới?
                    </h2>
                    <p className="lead mb-5" style={{ fontFamily: 'Quicksand, sans-serif', color: '#6B5E4F', fontSize: '1.25rem' }}>
                        Đặt lịch vận chuyển ngay hôm nay – Chúng tôi luôn sẵn sàng!
                    </p>
                    <button 
                        onClick={handleBookingClick} 
                        className="btn btn-lg fw-bold px-5 py-3 rounded-pill shadow-lg"
                        style={{ 
                            background: 'linear-gradient(135deg, #8B0000, #A52A2A)',
                            color: 'white',
                            fontFamily: 'Quicksand, sans-serif',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            transition: 'all 0.4s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-6px) scale(1.02)'}
                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        Đặt Lịch Vận Chuyển
                    </button>
                </div>
            </section>
        </>
    );
};

export default ServiceShipmentDetail;