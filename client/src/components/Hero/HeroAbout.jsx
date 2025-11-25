import React from 'react';
import { motion } from 'framer-motion';

const HeroAbout = () => {
    return (
        <section
            className="d-flex align-items-center position-relative"
            style={{
                minHeight: '70vh',
                backgroundImage: 'url(/images/About1.jpg)', // Ảnh nền phù hợp
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Lớp phủ tối nhẹ để làm nổi chữ */}
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
                    Giới thiệu về NekoKin
                </motion.h1>
                <motion.p
                    className="fs-4"
                    style={{ maxWidth: '700px', margin: '0 auto' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    Nơi những tấm lòng nhân ái, những con người tận tuỵ vì sức khoẻ và hạnh phúc của thú cưng.
                </motion.p>
            </div>
        </section>
    );
};

export default HeroAbout;
