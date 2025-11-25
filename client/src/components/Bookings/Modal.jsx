// src/components/Modal.jsx
import React, { useEffect, useRef, useCallback } from 'react'; // <-- Thêm useCallback vào đây

const Modal = ({ isOpen, onClose, children }) => {
    const modalRef = useRef(null);

    // Effect để xử lý việc hiển thị/ẩn modal bằng class của Bootstrap
    useEffect(() => {
        const modalElement = modalRef.current;
        if (!modalElement) return;

        let bsModal = window.bootstrap?.Modal.getInstance(modalElement);
        if (!bsModal) {
            bsModal = new window.bootstrap.Modal(modalElement, {
                backdrop: 'static',
                keyboard: false
            });
        }

        if (isOpen) {
            bsModal.show();
        } else {
            bsModal.hide();
        }

        return () => {
            if (bsModal) {
                bsModal.hide();
            }
        };
    }, [isOpen]);

    // Xử lý sự kiện khi modal của Bootstrap được ẩn hoàn toàn
    const handleModalHidden = useCallback(() => {
        if (!isOpen) {
            onClose();
        }
    }, [isOpen, onClose]);


    useEffect(() => {
        const modalElement = modalRef.current;
        if (modalElement) {
            modalElement.addEventListener('hidden.bs.modal', handleModalHidden);
        }
        return () => {
            if (modalElement) {
                modalElement.removeEventListener('hidden.bs.modal', handleModalHidden);
            }
        };
    }, [handleModalHidden]);


    if (!isOpen && !modalRef.current) {
        return null;
    }

    return (
        <div
            className={`modal fade ${isOpen ? 'show' : ''}`}
            id="generalModal"
            tabIndex="-1"
            aria-labelledby="generalModalLabel"
            aria-hidden={!isOpen}
            ref={modalRef}
            style={{ display: isOpen ? 'block' : 'none' }}
        >
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="generalModalLabel"></h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;