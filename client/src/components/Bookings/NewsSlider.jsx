import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import '../../App.css';

const NewsSlider = ({ featuredNews }) => {
    const sliderRef = useRef(null);

    const scrollLeft = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollLeft -= 320;
        }
    };

    const scrollRight = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollLeft += 320;
        }
    };

    return (
        <section className="news-slider-section">
            <div className="container position-relative">
                <h2 className="news-slider-title">Cập nhật thông tin mới nhất!</h2>

                <div className="news-slider-container" ref={sliderRef}>
                    {featuredNews.map((item) => (
                        <div key={item._id} className="news-slider-card">
                            <Link to={`/news/${item._id}`} className="text-decoration-none text-dark">
                                <img
                                    src={`http://localhost:5000/api/images/${item.image}`}
                                    alt={item.title}
                                    className="img-fluid rounded mb-3"
                                    onError={(e) => (e.target.src = '/images/default_news.jpg')}
                                />
                                <h5 className="news-slider-title-text">
                                    {item.title.length > 60 ? item.title.slice(0, 57) + '...' : item.title}
                                </h5>
                                <p className="news-slider-content">{item.content}</p>
                                <p className="news-slider-date">
                                    {new Date(item.date).toLocaleDateString()}
                                </p>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Nút điều hướng */}
                <button onClick={scrollLeft} className="news-slider-nav-btn news-slider-btn-left">
                    &#8249;
                </button>
                <button onClick={scrollRight} className="news-slider-nav-btn news-slider-btn-right">
                    &#8250;
                </button>

                {/* Nút xem thêm */}
                <div className="text-center mt-4">
                    <Link to="/news" className="btn px-4 py-2 news-slider-more-btn">
                        Tìm hiểu thêm
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default NewsSlider;
