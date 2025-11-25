import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import BookingModal from '../../components/Bookings/BookingModal';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";



const ServiceGroomDetail = () => {
    const { id: categoryId } = useParams();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [activeDot, setActiveDot] = useState(null);

    const galleryImages = [
        "/images/tampet.jpg",
        "/images/IMG_0326.png",
        "/images/tamtringua.jpg",
        "/images/thú-cưng-và-bs.jpg",
        "/images/DSC00083.jpg",
        "/images/IMG_8558.jpg",
        "/images/chailong.jpg",
        "/images/catmong.jpg",
        "/images/IMG_1882-scaled.jpg"
    ];
    const dots = [
        { id: 1, label: 'An toàn', description: 'Chúng tôi đã sử dụng kiến thức thú y của mình để thiết kế một phương pháp chải lông không gây sợ hãi cho thú cưng của bạn.' },
        { id: 2, label: 'Chất lượng cao', description: 'Chúng tôi cam kết sử dụng sản phẩm và kỹ thuật tốt nhất cho thú cưng của bạn.' },
        { id: 3, label: 'Sạch sẽ & vệ sinh', description: 'Dụng cụ và không gian luôn được khử trùng kỹ lưỡng để đảm bảo sự sạch sẽ.' },
        { id: 4, label: 'Tay nghề cao', description: 'Đội ngũ nhân viên được đào tạo chuyên sâu với nhiều năm kinh nghiệm.' },
        { id: 5, label: 'Thoải mái', description: 'Không gian thân thiện giúp thú cưng cảm thấy dễ chịu trong suốt quá trình.' },
        { id: 6, label: 'Sức khỏe là trên hết', description: 'Mọi dịch vụ đều hướng đến việc tăng cường sức khỏe cho thú cưng của bạn.' },
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
                setError('Không thể tải thông tin danh mục dịch vụ.');
            } finally {
                setLoading(false);
            }
        };
        if (categoryId) fetchCategoryDetails();
    }, [categoryId]);

    const openBookingModal = () => setIsBookingModalOpen(true);
    const closeBookingModal = () => setIsBookingModalOpen(false);

    if (loading) return <div className="text-center py-5">Đang tải thông tin danh mục...</div>;
    if (error) return <div className="alert alert-danger text-center py-5">{error}</div>;
    if (!category) return <div className="alert alert-info text-center py-5">Không tìm thấy danh mục dịch vụ.</div>;

    return (
        <>
            <div style={{ backgroundColor: '#ffff', marginTop: '40px', padding: '30px 0' }}>
                {/* Intro section */}
                <section className="after-grooming">
                    <div className="container">
                        <h3 className="heading text-center mb-4">Làm đẹp thú cưng</h3>
                        <div className="description-block-grooming-animation text-center">
                            <p className="FirstParagraph">
                                Làm đẹp thú cưng là điều cần thiết để giữ cho thú cưng của bạn trông xinh đẹp tuyệt vời.
                                Chúng tôi nhẹ nhàng rửa sạch bụi bẩn bám vào cơ thể một cách tự nhiên ở thú cưng,
                                giúp bộ lông thú cưng của bạn có mùi thơm tươi mát và trông bóng mượt.
                            </p>
                            <p className="FirstParagraph">
                                Và bạn có thể chắc chắn rằng mọi thứ chúng tôi làm đều cải thiện sức khỏe cho thú cưng của bạn
                                chứ không gây hại cho bé.
                            </p>
                            <p className="FirstParagraph">
                                Đôi bên cùng có lợi, cho bạn và cho thú cưng của bạn.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Dot Image Section */}
                <section className="image-section">
                    <div className="container position-relative my-5">
                        <div className="grooming-content position-relative text-center">
                            <img
                                src="/images/groomingdog1.png"
                                alt="Dog"
                                className="grooming-img img-fluid"
                                style={{ maxWidth: '90%', height: 'auto' }}
                            />

                            {dots.map(dot => (
                                <div
                                    key={dot.id}
                                    className={`dot dot-${dot.id} position-absolute text-center`}
                                    onClick={() => setActiveDot(dot.id === activeDot ? null : dot.id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {activeDot === dot.id ? (
                                        <div className="dot-description-box position-relative">
                                            <div className="dot-popup-number">{dot.id}</div>
                                            <h5>{dot.label}</h5>
                                            <p>{dot.description}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="dot-circle">{dot.id}</div>
                                            <div className="dot-label">{dot.label}</div>
                                        </>
                                    )}
                                </div>
                            ))}

                            <div className="text-center mt-4">
                                <button onClick={openBookingModal} className="book-btn">Đặt hẹn</button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Gallery */}
            <section className="gallery-section px-30" >
                <h3 className="gallery-section1 text-center mb-4">Chăm sóc cho thú cưng từ đầu đến đuôi</h3>
                <Slider
                    dots={true}
                    arrows={true}
                    infinite={true}
                    speed={600}
                    slidesToShow={1}
                    slidesToScroll={1}
                    className="gallery-slider full-width-slider"
                >
                    {[
                        {
                            top: [
                                { type: 'landscape', img: galleryImages[0] },
                                { type: 'portrait', img: galleryImages[1] },
                                { type: 'portrait', img: galleryImages[2] },
                                { type: 'portrait', img: galleryImages[8] }
                            ],
                            bottom: [
                                { type: 'portrait', img: galleryImages[3] },
                                { type: 'landscape', img: galleryImages[4] },
                                { type: 'portrait', img: galleryImages[5] },
                                { type: 'landscape', img: galleryImages[7] }
                            ]
                        },
                        {
                            top: [
                                { type: 'portrait', img: galleryImages[6] },
                                { type: 'landscape', img: galleryImages[7] },
                                { type: 'portrait', img: galleryImages[8] },
                                { type: 'portrait', img: galleryImages[3] }
                            ],
                            bottom: [
                                { type: 'landscape', img: galleryImages[0] },
                                { type: 'portrait', img: galleryImages[1] },
                                { type: 'portrait', img: galleryImages[2] },
                                { type: 'landscape', img: galleryImages[4] }
                            ]
                        }
                    ].map((slide, index) => (
                        <div key={index}>
                            <div className="gallery-row d-flex justify-content-center gap-3 mb-3">
                                {slide.top.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className={`gallery-img-wrapper ${item.type}`}
                                        style={{ backgroundImage: `url(${item.img})` }}
                                    />
                                ))}
                            </div>
                            <div className="gallery-row d-flex justify-content-center gap-3">
                                {slide.bottom.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className={`gallery-img-wrapper ${item.type}`}
                                        style={{ backgroundImage: `url(${item.img})` }}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </Slider>
            </section>


            {/* Booking Modal */}
            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={closeBookingModal}
                initialCategoryId={categoryId}
            />
        </>
    );
};

export default ServiceGroomDetail;
