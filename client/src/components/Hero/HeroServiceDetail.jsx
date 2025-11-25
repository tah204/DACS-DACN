import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const HeroServiceDetail = () => {
    const navigate = useNavigate();

    return (
        <section
            className="d-flex align-items-center position-relative"
            style={{
                minHeight: '70vh',
                backgroundImage: 'url(/images/heroservicedetail.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',

            }}
        >
            <div
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1 }}
            />
            <div
                className="container text-center text-white position-relative"
                style={{ zIndex: 2 }}
            >
                <motion.h1
                    className="fw-bold mb-4"
                    style={{ color: 'white', fontFamily: 'Quicksand, sans-serif', fontSize: '3.5rem' }}
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    Các dịch vụ chăm sóc sức khỏe thú cưng
                </motion.h1>
                <motion.p
                    className="fs-4 text-center"
                    style={{ fontFamily: 'Quicksand, sans-serif', maxWidth: '800px', margin: '0 auto' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    Chúng tôi cung cấp các dịch vụ chăm sóc sức khỏe toàn diện, hiện đại và an toàn cho thú cưng của bạn, từ khám tổng quát đến phẫu thuật chuyên sâu.
                </motion.p>
            </div>
        </section>
    );
};

export default HeroServiceDetail;
