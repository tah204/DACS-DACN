import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import BookingModal from '../../components/Bookings/BookingModal';
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import AOS from 'aos';
import 'aos/dist/aos.css';

const ServiceHotelDetail = () => {
    const { id: categoryId } = useParams();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    useEffect(() => {
        AOS.init({ duration: 1000, once: true });
    }, []);

    useEffect(() => {
        const fetchCategoryDetails = async () => {
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

        if (categoryId) {
            fetchCategoryDetails();
        }
    }, [categoryId]);

    const openBookingModal = () => setIsBookingModalOpen(true);
    const closeBookingModal = () => setIsBookingModalOpen(false);

    const galleryImages = [
        '/images/cca80f7300805e20647eca19707b8f5a.jpg',
        '/images/f1ad6a9c13dc13cd570de006bd01f867.jpg',
        '/images/04c853a00f3fe70dd1cee71acb1ae6f4.jpg',
        '/images/b197f28871659839d1d924e1dbe09563.jpg',
        '/images/b8fc575ff7fc15d36c762128dbf29c8f.jpg',
        '/images/bf2f36a0b1fccef842f30d651664bf85.jpg',
        '/images/50e9448f4c30884be559f5822478f875.jpg',
        '/images/b145ff5ce36fa7596e3073a78c3cadc3.jpg',
        '/images/fbe993cd6da19d38c48335d2b4b8e03e.jpg'
    ];

    if (loading) return <div className="text-center py-5">Đang tải thông tin danh mục...</div>;
    if (error) return <div className="alert alert-danger text-center py-5">{error}</div>;
    if (!category) return <div className="alert alert-info text-center py-5">Không tìm thấy danh mục dịch vụ.</div>;

    return (
        <>
            <section className="hotel-header py-5 bg-light mt-5" style={{ backgroundColor: '#FAF7F1' }} data-aos="fade-up">
                <div className="container">
                    <h3 className="heading text-center mb-4">Khách sạn thú cưng</h3>
                    <div className="row justify-content-center">
                        <div className="col-md-5 mb-4" data-aos="fade-right">
                            <p className="FirstParagraph">
                                Đi du lịch có thể khó khăn khi bạn là người nuôi thú cưng. Bạn không muốn để thú cưng một mình, nhưng không phải khách sạn hay Airbnb nào cũng thân thiện với vật nuôi. Và xa bạn cũng không dễ dàng gì với thú cưng của bạn. Thú cưng cũng cảm thấy cô đơn và buồn bã như chúng ta khi không có gia đình bên cạnh.
                            </p>
                        </div>
                        <div className="col-md-5 mb-4" data-aos="fade-left">
                            <p className="FirstParagraph">
                                Khách sạn dành cho thú cưng sang trọng của chúng tôi là giải pháp hoàn hảo cho những người bận rộn yêu thú cưng của mình và muốn chúng được chăm sóc tốt nhất khi đi du lịch. Nó như một kỳ nghỉ 5 sao, được trang bị mọi thứ mà người bạn đồng hành của bạn có thể muốn, bao gồm cả tình yêu. Hãy để chúng tôi chiêu đãi thú cưng của bạn như hoàng gia khi bạn đang nghỉ dưỡng.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div>
                <section className="hotel-section px-0" data-aos="fade-up">
                    <Slider
                        dots={true}
                        arrows={true}
                        infinite={true}
                        speed={600}
                        slidesToShow={1}
                        slidesToScroll={1}
                        className="gallery-slider full-width-slider"
                    >
                        {[{
                            top: [
                                { type: 'landscape', img: galleryImages[0] },
                                { type: 'portrait', img: galleryImages[1] },
                                { type: 'portrait', img: galleryImages[2] },
                                { type: 'portrait', img: galleryImages[8] }
                            ], bottom: [
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
                        }].map((slide, index) => (
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

                <section className="py-4 bg-light text-center" data-aos="zoom-in">
                    <div className="container">
                        <button className="book-btn btn-danger btn-lg rounded-pill " onClick={openBookingModal}>
                            Đặt Phòng Ngay
                        </button>
                    </div>
                </section>

                <section className="testimonial-section text-center py-5" data-aos="fade-up">
                    <div className="container">
                        <h2 className="testimonial-title">Đừng chỉ nghe chúng tôi nói!</h2>
                        <p className="testimonial-subtitle">Hãy gặp gỡ những khách hàng của chúng tôi</p>

                        <div className="testimonial-content p-4 rounded-4 shadow" style={{ backgroundColor: '#ffffff', maxWidth: '700px', margin: '0 auto' }}>
                            <img src="/images/thú -cưng-và-bs-2.jpg" alt="Lisa & Mittens" className="testimonial-img mb-3 rounded-4" style={{ width: '100%', height: 'auto', maxHeight: '350px', objectFit: 'cover' }} />

                            <p className="testimonial-text fs-5 fst-italic">
                                "Khách sạn thú cưng vượt qua mọi mong đợi của chúng tôi! Thú cưng của chúng tôi, Mittens, đã được đối xử rất tốt – tôi có thể biết chúng vui như thế nào khi đi và ở lại mỗi lần! Bạn có thể tin tưởng chúng tôi 100% với thú cưng của mình!"
                            </p>
                            <p className="testimonial-name fw-bold mt-3">Lisa & Mittens</p>
                        </div>
                    </div>
                </section>

                <BookingModal
                    isOpen={isBookingModalOpen}
                    onClose={closeBookingModal}
                    initialCategoryId={categoryId}
                />
            </div>
        </>
    );
};

export default ServiceHotelDetail;
