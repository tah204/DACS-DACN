import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import HeroBlog from '../../components/Hero/HeroBlog';

const News = () => {
  const [news, setNews] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 8;

  useEffect(() => {
    axios.get('http://localhost:5000/api/news')
      .then((response) => {
        const sortedNews = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setNews(sortedNews);
        const extractedTopics = ['Tất cả', ...new Set(sortedNews.map(item => item.topic))];
        setTopics(extractedTopics);
      })
      .catch((error) => console.error('Error fetching news:', error));
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedTopic]);

  const filteredNews = selectedTopic === 'Tất cả' ? news : news.filter(item => item.topic === selectedTopic);
  const latestNews = filteredNews[0];
  const remainingNews = filteredNews.slice(1);
  const indexOfLastNews = currentPage * newsPerPage;
  const currentNews = remainingNews.slice(0, indexOfLastNews);
  const totalPages = Math.ceil(remainingNews.length / newsPerPage);

  const loadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <section className="news-section pt-5 pb-5" style={{ backgroundColor: '#fffaf4' }}>
      <HeroBlog />
      <div className="container mt-5 pt-5">
        <div className="row">
          {/* Cột trái: danh mục chủ đề */}
          <div className="col-md-3 mb-4">
            <div className="bg-white rounded shadow-sm p-3">
              <h5 className="fw-bold mb-3" style={{ fontFamily: 'Quicksand, sans-serif', color: '#0d2554', fontSize: '1.25rem' }}>Topic</h5>
              <ul className="list-unstyled">
                {topics.map((topic, index) => (
                  <li
                    key={index}
                    onClick={() => { setSelectedTopic(topic); setCurrentPage(1); }}
                    style={{
                      cursor: 'pointer',
                      fontWeight: selectedTopic === topic ? 'bold' : 'normal',
                      borderLeft: selectedTopic === topic ? '4px solid #8B0000' : '4px solid transparent',
                      paddingLeft: '0.75rem',
                      marginBottom: '0.75rem',
                      fontSize: '1.2rem',
                      fontFamily: 'Quicksand, sans-serif',
                      color: selectedTopic === topic ? '#8B0000' : '#333'
                    }}
                  >
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Cột phải: danh sách tin tức */}
          <div className="col-md-9">
            <h2 className="text-start mb-4" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 700, color: '#0d2554' }}>{selectedTopic}</h2>

            {/* Bài viết mới nhất */}
            {latestNews && (
              <div className="row mb-5">
                <div className="col-md-6">
                  <Link to={`/news/${latestNews._id}`} className="text-decoration-none">
                    <img
                      src={`http://localhost:5000/api/images/${latestNews.image}`} // Tải từ backend
                      alt={latestNews.title}
                      className="img-fluid rounded w-100 hover-zoom"
                      style={{ objectFit: 'cover', maxHeight: '300px', transition: 'transform 0.3s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      onError={(e) => (e.target.src = '/images/default_news.jpg')}
                    />
                  </Link>
                </div>
                <div className="col-md-6">
                  <h4 className="fw-bold" style={{ fontFamily: 'Quicksand, sans-serif', color: '#0d2554' }}>
                    <Link to={`/news/${latestNews._id}`} className="text-decoration-none " style={{ fontFamily: 'Quicksand, sans-serif', color: '#0d2554' }}>
                      {latestNews.title}
                    </Link>
                  </h4>
                  <p className="text-muted">{latestNews.content}</p>
                  <Link
                    to={`/news/${latestNews._id}`}
                    className="text-decoration-none"
                    style={{ color: '#8B0000', fontWeight: 'bold' }}
                    onMouseEnter={(e) => {
                      const span = e.currentTarget.querySelector('span');
                      if (span) span.style.marginLeft = '4px';
                    }}
                    onMouseLeave={(e) => {
                      const span = e.currentTarget.querySelector('span');
                      if (span) span.style.marginLeft = '0';
                    }}
                  >
                    Đọc thêm <span className="arrow-hover">→</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Danh sách bài viết còn lại */}
            <div className="row g-4">
              {currentNews.length > 0 ? (
                currentNews.map((item) => (
                  <div className="col-12 col-md-6 col-lg-4" key={item._id}>
                    <div
                      style={{ fontFamily: 'Quicksand, sans-serif', color: '#0d2554', backgroundColor: '#fffaf4', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                      className="p-2 rounded hover-highlight"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <Link to={`/news/${item._id}`} className="text-decoration-none ">
                        <img
                          src={`http://localhost:5000/api/images/${item.image}`} // Tải từ backend
                          alt={item.title}
                          className="img-fluid rounded mb-3 hover-zoom"
                          onError={(e) => (e.target.src = '/images/default_news.jpg')}
                          style={{ objectFit: 'cover', height: '200px', width: '100%', transition: 'transform 0.3s ease' }}
                        />
                      </Link>
                      <h5 style={{ color: '#0d2554' }}>
                        <Link to={`/news/${item._id}`} className="text-decoration-none " style={{ fontWeight: 700, color: '#0d2554' }}>
                          {item.title}
                        </Link>
                      </h5>
                      <p className="text-muted">{item.content}</p>
                      <Link
                        to={`/news/${item._id}`} // Sửa link để trỏ đúng đến bài viết
                        className="text-decoration-none"
                        style={{ color: '#8B0000', fontWeight: 'bold' }}
                        onMouseEnter={(e) => {
                          const span = e.currentTarget.querySelector('span');
                          if (span) span.style.marginLeft = '4px';
                        }}
                        onMouseLeave={(e) => {
                          const span = e.currentTarget.querySelector('span');
                          if (span) span.style.marginLeft = '0';
                        }}
                      >
                        Đọc thêm <span className="arrow-hover">→</span>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center">
                  <p className="text-muted">Không tìm thấy tin tức.</p>
                </div>
              )}
            </div>

            {/* Nút tải thêm */}
            {currentPage < totalPages && (
              <div className="row mt-4">
                <div className="col-12 text-center">
                  <button
                    onClick={loadMore}
                    className="btn"
                    style={{ backgroundColor: '#8B0000', color: 'white', fontWeight: 'bold', padding: '0.5rem 1.5rem' }}
                  >
                    Tải thêm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default News;