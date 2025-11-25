import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaFacebook, FaEnvelope, FaFacebookMessenger } from 'react-icons/fa';
import HeroBlog from '../../components/Hero/HeroBlog';
import '../../App.css';

const NewsDetail = () => {
  const { id } = useParams();
  const [newsItem, setNewsItem] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError('ID không hợp lệ.');
      return;
    }

    axios.get(`http://localhost:5000/api/news/${id}`).then((response) => {
      setNewsItem(response.data);
      setError(null);

      axios.get(`http://localhost:5000/api/news`).then((res) => {
        const related = res.data
          .filter((item) => item.topic === response.data.topic && item._id !== response.data._id)
          .slice(0, 3);
        setRelatedNews(related);
      });
    }).catch(() => {
      setError('Không thể tải tin tức.');
    });
  }, [id]);

  if (error) return <div className="text-center py-5">{error}</div>;
  if (!newsItem) return <div className="text-center py-5">Đang tải...</div>;

  const youtubeUrlMatch = newsItem.fullContent?.match(/<iframe[^>]+src=\"([^\"]+)\"/);
  const youtubeUrl = youtubeUrlMatch ? youtubeUrlMatch[1] : null;

  const shareLink = youtubeUrl;
  const shareTitle = newsItem.title;

  const renderShareButtons = () => {
    return (
      <div className="share-buttons">
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-sm btn-light border d-flex align-items-center"
        >
          <FaFacebook className="me-2 text-primary" /> Facebook
        </a>
        <a
          href={`https://www.facebook.com/dialog/send?app_id=YOUR_APP_ID&link=${encodeURIComponent(shareLink)}&redirect_uri=${encodeURIComponent(shareLink)}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-sm btn-light border d-flex align-items-center"
        >
          <FaFacebookMessenger className="me-2 text-info" /> Messenger
        </a>
        <a
          href={`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareLink)}`}
          className="btn btn-sm btn-light border d-flex align-items-center"
        >
          <FaEnvelope className="me-2 text-danger" /> Gmail
        </a>
      </div>
    );
  };

  return (
    <section className="news-detail-section">
      <div className="w-100 mb-3">
        <HeroBlog height="160px" />
      </div>

      <div className="container news-detail-container">
        <div className="row align-items-center mb-4 gx-5">
          <div className="col-md-7">
            <h1 className="news-title">{newsItem.title}</h1>
            <p className="text-muted">
              <small>{new Date(newsItem.date).toLocaleDateString()}</small>
            </p>
          </div>
          <div className="col-md-5 text-md-end text-center">
            {renderShareButtons()}
          </div>
        </div>

        <article className="news-content">
          <div dangerouslySetInnerHTML={{ __html: newsItem.fullContent }} />
        </article>

        <div className="text-center my-4">
          {renderShareButtons()}
        </div>

        <div className="text-center my-5">
          <Link to="/news" className="btn btn-outline-secondary">← Quay lại trang tin tức</Link>
        </div>

        {relatedNews.length > 0 && (
          <div className="mt-5">
            <h4 className="related-title">Bài viết liên quan</h4>
            <p>Nơi bạn có thể tìm hiểu thêm về các tin tức và xu hướng thú y mới nhất!</p>
            <div className="row g-4">
              {relatedNews.map((item) => (
                <div className="col-md-4" key={item._id}>
                  <Link to={`/news/${item._id}`} className="text-decoration-none text-dark">
                    <div className="card h-100 border-0 shadow-sm">
                      <img
                        src={`/images/${item.image}`}
                        alt={item.title}
                        className="card-img-top img-fluid"
                        style={{ height: '180px', objectFit: 'cover' }}
                        onError={(e) => (e.target.src = '/images/default_news.jpg')}
                      />
                      <div className="card-body">
                        <h5 className="card-title related-item-title">{item.title}</h5>
                        <p className="card-text text-muted related-item-snippet">{item.content?.substring(0, 100)}...</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsDetail;
