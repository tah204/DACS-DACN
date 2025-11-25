import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const HeroService = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/booking');
    };

    return (
        <section
            className="d-flex align-items-center position-relative"
            style={{
                minHeight: '70vh',
                backgroundImage: 'url(/images/thuy-cute-dog-e1684488473597.png)',
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
                    Chăm sóc tận tâm
                </motion.h1>
                <motion.p
                    className="fs-4 text-center"
                    style={{ maxWidth: '800px', margin: '0 auto' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    Từ lúc bạn bước vào đến khi rời đi, thú cưng của bạn luôn được yêu thương và chăm sóc như thành viên trong gia đình.
                </motion.p>
            </div>
        </section>
    );
};

export default HeroService;
