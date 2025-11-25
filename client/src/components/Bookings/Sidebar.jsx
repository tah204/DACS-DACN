import React, { useEffect, useRef, useCallback } from 'react';
import './Sidebar.css'; // Import file CSS riêng cho Sidebar

const Sidebar = ({ isOpen, onClose, children, title }) => {
    const sidebarRef = useRef(null); // Ref để tham chiếu đến element sidebar

    // Effect để xử lý việc đóng sidebar khi click ra ngoài overlay
    // và quản lý overflow của body
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden'; // Ngăn cuộn trang chính
        } else {
            // Đảm bảo gỡ bỏ event listener và khôi phục overflow khi đóng
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = '';
        }

        // Cleanup function: gỡ bỏ event listener khi component unmount hoặc isOpen thay đổi
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = ''; // Đảm bảo scroll được phục hồi
        };
    }, [isOpen, onClose]); // Dependencies: chỉ chạy lại khi isOpen hoặc onClose thay đổi

    // Conditional rendering của component này phải nằm sau tất cả các hooks
    // Nếu Sidebar không mở, chúng ta sẽ không render nó để tránh các vấn đề về layout
    // Hoặc nếu bạn muốn nó luôn mount và chỉ ẩn/hiện bằng CSS, thì không cần dòng này
    // Tuy nhiên, với cấu trúc hiện tại và việc quản lý overlay, việc unmount/remount là hợp lý
    if (!isOpen) {
        return null;
    }

    // Khi sidebar không mở, không render gì cả
    // Điều này sẽ giúp tránh việc các ref là null khi bạn truy cập chúng trong useEffect nếu sidebar không mount
    // Tuy nhiên, nếu bạn muốn animation mượt mà khi đóng, bạn cần giữ component mount và điều khiển bằng CSS transition.
    // Với setup hiện tại, `transform` trong CSS đã làm điều đó.
    // Dòng `if (!isOpen) { return null; }` có thể gây giật nếu bạn muốn animation khi đóng.
    // Giữ nó mount và chỉ điều khiển bằng CSS là tốt hơn.
    // Tạm thời comment dòng này để ưu tiên Rules of Hooks và hiệu ứng chuyển động.

    return (
        <>
            {/* Overlay: Phần nền mờ phía sau sidebar */}
            <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}></div>

            {/* Sidebar chính */}
            <div ref={sidebarRef} className={`sidebar ${isOpen ? 'show' : ''}`}>
                <div className="sidebar-header">
                    <h5 className="sidebar-title">{title}</h5>
                    <button type="button" className="sidebar-close-btn" onClick={onClose}>
                        &times; {/* Icon đóng (dấu X) */}
                    </button>
                </div>
                <div className="sidebar-body">
                    {children} {/* Nội dung của BookingModal sẽ được render ở đây */}
                </div>
            </div>
        </>
    );
};

export default Sidebar;