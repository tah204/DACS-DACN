import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalServices: 0,
    totalNews: 0,
    totalBookings: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    revenueDetails: [] // Khởi tạo rỗng để tránh undefined
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
          setLoading(false);
          return;
        }
        const response = await axios.get('http://localhost:5000/api/dashboard-stats', {
          headers: { Authorization: `Bearer ${token}` },
          params: { startDate, endDate }
        });
        console.log('API Response:', response.data); // Debug log
        const data = response.data || {};
        setStats({
          totalServices: data.totalServices || 0,
          totalNews: data.totalNews || 0,
          totalBookings: data.totalBookings || 0,
          totalCustomers: data.totalCustomers || 0,
          totalRevenue: data.totalRevenue || 0,
          revenueDetails: Array.isArray(data.revenueDetails) ? data.revenueDetails : []
        });
        setError('');
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error.response?.data || error.message);
        setError(`Lỗi: ${error.response?.statusText || 'Không xác định'}. ${error.response?.data?.message || 'Vui lòng kiểm tra server hoặc thử lại.'}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [startDate, endDate]);

  const exportToExcel = () => {
    const dataToExport = stats.revenueDetails.map(service => ({
      'Dịch vụ': service.name || 'Không xác định',
      'Doanh thu (VND)': service.price || 0
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Doanh thu');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'DoanhThu_Thú_Cưng.xlsx');
  };

  if (loading) return <div className="card p-4">Đang tải dữ liệu...</div>;
  if (error) return (
    <div className="card p-4">
      <div className="alert alert-danger">{error}</div>
      <button className="btn btn-primary mt-2" onClick={() => window.location.reload()}>Thử lại</button>
    </div>
  );

  return (
    <div className="card p-4">
      <h2 className="card-title mb-4">Dashboard Quản Trị</h2>
      <p className="card-text mb-4">Chào mừng đến với bảng điều khiển quản trị.</p>

      <div className="row mb-4">
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card h-100 bg-primary text-white p-3">
            <h5 className="card-title">Tổng Dịch Vụ</h5>
            <p className="card-text display-4">{stats.totalServices}</p>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card h-100 bg-success text-white p-3">
            <h5 className="card-title">Tổng Tin Tức</h5>
            <p className="card-text display-4">{stats.totalNews}</p>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card h-100 bg-warning text-white p-3">
            <h5 className="card-title">Tổng Đơn Đặt Hàng</h5>
            <p className="card-text display-4">{stats.totalBookings}</p>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card h-100 bg-info text-white p-3">
            <h5 className="card-title">Tổng Khách Hàng</h5>
            <p className="card-text display-4">{stats.totalCustomers}</p>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card h-100 bg-purple text-black p-3">
            <h5 className="card-title">Tổng Doanh Thu</h5>
            <p className="card-text display-4">
              {stats.totalRevenue > 0 ? stats.totalRevenue.toLocaleString() : '0'} VND
            </p>
          </div>
        </div>
      </div>

      <h3 className="mb-3">Thống kê Doanh thu Chi tiết</h3>
      <div className="mb-4 d-flex gap-3">
        <div>
          <label className="form-label">Từ ngày:</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="form-control" />
        </div>
        <div>
          <label className="form-label">Đến ngày:</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="form-control" />
        </div>
        <button className="btn btn-primary mt-4" onClick={exportToExcel}>Xuất Excel</button>
      </div>

      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Dịch vụ</th>
            <th>Doanh thu (VND)</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(stats.revenueDetails) && stats.revenueDetails.length > 0 ? (
            stats.revenueDetails.map((service, index) => (
              <tr key={index}>
                <td>{service.name || 'Không xác định'}</td>
                <td>{(service.price || 0).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" className="text-center">Không có dữ liệu doanh thu</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Thêm modal để khắc phục lỗi share-modal.js */}
      <div
        id="shareModal"
        className="modal fade"
        tabIndex="-1"
        aria-labelledby="shareModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="shareModalLabel">Chia sẻ</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">Nội dung chia sẻ...</div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;