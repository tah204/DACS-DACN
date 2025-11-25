import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const HeroIntro = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/services');
    };

    return (
        <section className="position-relative" style={{ minHeight: '100vh' }}>
            {/* Ảnh nền gif */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="w-100 h-100 position-absolute top-0 start-0"
                style={{ objectFit: 'cover', zIndex: 0 }}
            >
                <source src="/images/intro_small.mp4" type="video/mp4" />
                Trình duyệt của bạn không hỗ trợ thẻ video.
            </video>

            {/* Nội dung dịch xuống phần dưới */}
            <div
                className="container h-100 d-flex flex-column justify-content-start align-items-center text-white text-center"
                style={{
                    position: 'relative',
                    zIndex: 2,
                    paddingTop: '30vh',
                }}
            >
                <motion.h1
                    className="display-3 fw-bold mb-4"
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    style={{ color: 'white', fontFamily: 'Quicksand, sans-serif' }}
                >
                    Chào mừng đến với PetHub
                </motion.h1>

                <motion.p
                    className="fs-4 mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{ maxWidth: '700px' }}
                >
                    PetHub là nơi bạn tìm thấy mọi điều tốt nhất cho thú cưng của mình – từ dịch vụ, đến kiến thức và tư vấn chuyên sâu.
                </motion.p>

                <motion.button
                    onClick={handleClick}
                    className="btn btn-lg px-5 fw-semibold"
                    style={{
                        backgroundColor: '#8B0000',
                        color: 'white',
                        border: 'none',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    Đặt hẹn ngay
                </motion.button>
            </div>
        </section>
    );
};

export default HeroIntro;
