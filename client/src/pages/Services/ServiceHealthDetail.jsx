import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import HeroServiceDetail from '../../components/Hero/HeroServiceDetail';
import BookingModal from '../../components/Bookings/BookingModal';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import axios from 'axios';

const clinicalServices = [
    {
        title: 'Xét nghiệm',
        content: 'Khi nhận thấy thú cưng cư xử khác thường, bạn muốn nhanh chóng tìm hiểu nguyên nhân. Chúng tôi có phòng thí nghiệm nội bộ để phân tích máu và các xét nghiệm khác, đảm bảo quy trình nghiêm ngặt và kết quả nhanh chóng, đáng tin cậy hơn bất kỳ bệnh viện thú y nào trong khu vực.'
    },
    {
        title: 'Khám sức khỏe',
        content: 'Khám sức khỏe tổng quát giúp phát hiện sớm các vấn đề sức khỏe tiềm ẩn, đảm bảo thú cưng của bạn luôn khỏe mạnh và phát triển tốt.'
    },
    {
        title: 'Tiêm phòng',
        content: 'Chúng tôi cung cấp dịch vụ tiêm phòng cho bệnh nguy hiểm, đảm bảo sức khỏe cho thú cưng của bạn. Đội ngũ bác sĩ chuyên nghiệp và giàu kinh nghiệm của chúng tôi sẽ chăm sóc tận tình để thú cưng của bạn luôn khỏe mạnh và an toàn.'
    },
    {
        title: 'Da liễu',
        content: 'Dịch vụ da liễu giúp chẩn đoán và điều trị các bệnh về da, dị ứng, ký sinh trùng ngoài da cho thú cưng.'
    },
    {
        title: 'Phục hồi chức năng',
        content: 'Dịch vụ phục hồi chức năng giúp thú cưng hồi phục sau phẫu thuật, chấn thương hoặc các vấn đề vận động.'
    },
    {
        title: 'Siêu âm',
        content: 'Chẩn đoán hình ảnh bằng siêu âm giúp phát hiện các vấn đề nội tạng, thai kỳ và nhiều bệnh lý khác.'
    },
];

const ServiceHealthDetail = () => {
    const { id: categoryId } = useParams();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(null); // Đảm bảo khởi tạo là null để không tự mở popup
    const buttonRefs = useRef([]);

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

    // Chia thành 3 cột gần bằng nhau
    const columns = [[], [], []];
    clinicalServices.forEach((item, idx) => {
        columns[idx % 3].push({ ...item, idx });
    });

    // Tìm vị trí cột và hàng của activeIndex
    let popupCol = null, popupRow = null;
    columns.forEach((col, colIdx) => {
        col.forEach((item, rowIdx) => {
            if (item.idx === activeIndex) {
                popupCol = colIdx;
                popupRow = rowIdx;
            }
        });
    });

    return (
        <>
            <div
                style={{
                    width: '100vw',
                    position: 'relative',
                    left: '50%',
                    right: '50%',
                    marginLeft: '-50vw',
                    marginRight: '-50vw',
                }}
            >
                <HeroServiceDetail />
            </div>

            {/* Section: Giới thiệu */}
            <motion.div
                className="service-intro-outer"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ staggerChildren: 0.3 }}
            >
                <div className="service-intro-inner">
                    <h2 className="service-intro-title">Tất cả đều dành cho thú cưng của bạn</h2>
                    <div className="service-intro-content">
                        <motion.div
                            className="service-intro-col"
                            initial={{ opacity: 0, x: -100 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            Thú cưng của bạn không thể nói. Chúng không thể nói rằng chúng bị bệnh hoặc không ổn ở đâu. Điều đó khiến bạn trở thành tuyến phòng thủ đầu tiên của chúng. Chúng trông cậy vào bạn, những người thân của chúng, để nhận thấy các vấn đề rồi đưa chúng đến bác sĩ thú y. Bạn hiểu về người bạn của mình và bác sĩ của chúng tôi có kỹ năng chuyên môn, chúng ta có thể làm việc cùng nhau để chẩn đoán thú cưng của bạn và quyết định phương pháp điều trị tốt nhất.<br /><br />
                            Đó cũng là lý do tại sao chúng ta phải có các công cụ để chẩn đoán chính xác các vấn đề sức khỏe không thể nhìn thấy ở bên ngoài. Sau đó, chúng tôi có thể sử dụng tất cả các kỹ năng của mình để giải thích các chẩn đoán và chúng ta có thể tìm ra các phương pháp điều trị hiệu quả.
                        </motion.div>
                        <motion.div
                            className="service-intro-col"
                            initial={{ opacity: 0, x: 100 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            Nếu không được đào tạo tốt nhất và có công cụ tốt nhất, chúng tôi không thể chăm sóc cho thú cưng của bạn một cách tốt nhất. Đó là lý do tại sao chúng tôi đã đầu tư vào các bác sĩ thú y và thiết bị tốt nhất, đồng thời tạo ra một số cơ sở y tế dành cho động vật tốt nhất trong khu vực.<br /><br />
                            Các bác sĩ thú y của chúng tôi có trình độ chuyên môn cao với nhiều năm kinh nghiệm chẩn đoán và điều trị cho thú cưng gặp các vấn đề sức khỏe phức tạp. Và chúng tôi tin rằng dịch vụ chăm sóc y tế tốt nhất cho thú cưng của bạn đến từ việc chúng ta làm việc cùng nhau theo cách hòa nhập, hợp tác và thoải mái cho bạn và thú cưng của bạn nhất có thể.
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Section: Các dịch vụ */}
            <section
                style={{
                    width: '100vw',
                    position: 'relative',
                    left: '50%',
                    right: '50%',
                    marginLeft: '-50vw',
                    marginRight: '-50vw',
                    background: 'transparent',
                    zIndex: 2,
                }}
            >
                <div
                    className="py-5 position-relative"
                    style={{
                        background: '#fff',
                        borderRadius: '32px 32px 0 0',
                        boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '3rem 0',
                    }}
                >
                    <div style={{ width: '100%', maxWidth: 1200, padding: '0 24px', margin: '0 auto' }}>
                        <h2
                            className="fw-bold text-center mb-4"
                            style={{
                                color: '#002060',
                                fontSize: '2.8rem',
                                lineHeight: 1.15,
                                paddingBottom: '2rem',
                                fontFamily: 'Quicksand, sans-serif',
                            }}
                        >
                            Các dịch vụ được xây dựng dựa trên nhu cầu của thú cưng
                        </h2>

                        <div
                            className="d-flex justify-content-center align-items-start gap-3 flex-nowrap position-relative"
                            style={{ minHeight: 400 }}
                        >
                            {columns.map((col, colIdx) => (
                                <div
                                    className="d-flex flex-column align-items-center position-relative"
                                    key={colIdx}
                                    style={{
                                        flex: '0 1 340px',
                                        maxWidth: 340,
                                        width: '100%',
                                    }}
                                >
                                    {/* Hiển thị popup nếu cần */}
                                    {activeIndex !== null && popupCol === colIdx && (
                                        <div
                                            className="popup-col-overlay"
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                minHeight: '100%',
                                                zIndex: 2000,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                background: 'rgba(0,32,96,0.04)',
                                                color: 'white',
                                            }}
                                        >
                                            <motion.div
                                                initial={{ opacity: 0, y: 50 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.4 }}
                                                style={{
                                                    background: '#002060',
                                                    color: 'white',
                                                    borderRadius: '12px',
                                                    minHeight: '320px',
                                                    width: '100%',
                                                    maxWidth: 340,
                                                    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                                                    padding: '2rem 1.5rem',
                                                    position: 'relative',
                                                    zIndex: 3000,
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="d-flex justify-content-between align-items-start mb-2" style={{ width: '100%' }}>
                                                    <h4 className="fw-bold mb-0" style={{ color: 'white' }}>{clinicalServices[activeIndex].title}</h4>
                                                    <button
                                                        className="btn btn-sm btn-light ms-2"
                                                        style={{
                                                            borderRadius: '50%',
                                                            fontWeight: 'bold',
                                                            fontSize: '1.2rem',
                                                            padding: '0.25rem 0.7rem',
                                                            color: '#002060',
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveIndex(null);
                                                        }}
                                                    >
                                                        -
                                                    </button>
                                                </div>
                                                <div style={{ fontSize: '1.08rem', lineHeight: 1.7 }}>
                                                    {clinicalServices[activeIndex].content}
                                                </div>
                                            </motion.div>
                                        </div>
                                    )}

                                    {/* Các nút dịch vụ */}
                                    {!(activeIndex !== null && popupCol === colIdx) &&
                                        col.map((item, rowIdx) => (
                                            <motion.div
                                                key={item.idx}
                                                initial={{ opacity: 0, y: 50 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.4, delay: rowIdx * 0.1 }}
                                                viewport={{ once: true }}
                                                style={{
                                                    marginBottom: 16,
                                                    width: '100%',
                                                    maxWidth: 340,
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <button
                                                    ref={(el) => {
                                                        if (!buttonRefs.current[colIdx]) buttonRefs.current[colIdx] = [];
                                                        buttonRefs.current[colIdx][rowIdx] = el;
                                                    }}
                                                    className="text-start fw-semibold py-3 px-3 border-0 rounded shadow-sm"
                                                    style={{
                                                        width: '100%',
                                                        fontSize: '1.3rem',
                                                        background: '#FAF7F1',
                                                        color: '#0d2554',
                                                    }}
                                                    onClick={() => setActiveIndex(item.idx)}
                                                >
                                                    <span>{item.title}</span>
                                                    <span
                                                        style={{
                                                            fontWeight: 'bold',
                                                            fontSize: '1.35rem',
                                                            color: '#8B0000',
                                                            marginLeft: 12,
                                                        }}
                                                    >
                                                        +
                                                    </span>
                                                </button>
                                            </motion.div>
                                        ))}
                                </div>
                            ))}
                        </div>

                        {/* Nút Đặt Hẹn */}
                        <div className="text-center mt-3" data-aos="zoom-in">
                            <button className="book-btn btn-danger btn-lg rounded-pill" onClick={openBookingModal}>
                                Đặt hẹn Ngay
                            </button>
                        </div>

                        {/* Overlay toàn màn hình */}
                        {activeIndex !== null && (
                            <div
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    width: '100vw',
                                    height: '100vh',
                                    zIndex: 4000,
                                    background: 'rgba(0,0,0,0)',
                                }}
                                onClick={() => setActiveIndex(null)}
                            />
                        )}
                    </div>
                </div>
            </section>

            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={closeBookingModal}
                initialCategoryId={categoryId}
            />
        </>
    );
};

export default ServiceHealthDetail;