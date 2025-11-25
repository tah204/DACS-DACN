import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Account = () => {
  const [user, setUser] = useState({ username: '', email: '', customer: { name: '', phone: '' } });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/auth/user/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => setUser(response.data))
      .catch(error => console.error('Error fetching user data:', error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      customer: { ...prev.customer, [name]: value }
    }));
  };

  const handleSave = () => {
    const token = localStorage.getItem('token');
    axios.put(`http://localhost:5000/auth/customers/${user.customer._id}`, user.customer, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setIsEditing(false);
        alert('Thông tin đã được cập nhật!');
      })
      .catch(error => console.error('Error updating customer data:', error));
  };

  return (
    <div className="container mt-5" style={{ paddingTop: '30px' }}>
      <h2 className="mb-4 text-center" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 'bold', color: '#333' }}>
        Tài khoản
      </h2>
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card p-4 shadow-sm" style={{ backgroundColor: '#f8f9fa', borderRadius: '15px', border: 'none' }}>
            <div className="mb-3">
              <label className="form-label" style={{ fontFamily: 'Quicksand, sans-serif', color: '#555' }}>
                Tên tài khoản
              </label>
              <input
                type="text"
                className="form-control"
                value={user.username || ''}
                disabled
                style={{
                  backgroundColor: '#e9ecef',
                  color: '#555',
                  borderRadius: '8px',
                  border: '1px solid #ced4da',
                  fontFamily: 'Quicksand, sans-serif'
                }}
              />
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ fontFamily: 'Quicksand, sans-serif', color: '#555' }}>
                Email
              </label>
              <input
                type="email"
                className="form-control"
                value={user.email || ''}
                disabled
                style={{
                  backgroundColor: '#e9ecef',
                  color: '#555',
                  borderRadius: '8px',
                  border: '1px solid #ced4da',
                  fontFamily: 'Quicksand, sans-serif'
                }}
              />
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ fontFamily: 'Quicksand, sans-serif', color: '#555' }}>
                Tên khách hàng
              </label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={user.customer?.name || ''}
                onChange={handleChange}
                disabled={!isEditing}
                style={{
                  backgroundColor: isEditing ? '#fff' : '#e9ecef',
                  color: '#555',
                  borderRadius: '8px',
                  border: '1px solid #ced4da',
                  fontFamily: 'Quicksand, sans-serif'
                }}
              />
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ fontFamily: 'Quicksand, sans-serif', color: '#555' }}>
                Số điện thoại
              </label>
              <input
                type="text"
                className="form-control"
                name="phone"
                value={user.customer?.phone || ''}
                onChange={handleChange}
                disabled={!isEditing}
                style={{
                  backgroundColor: isEditing ? '#fff' : '#e9ecef',
                  color: '#555',
                  borderRadius: '8px',
                  border: '1px solid #ced4da',
                  fontFamily: 'Quicksand, sans-serif'
                }}
              />
            </div>
            <div className="d-flex justify-content-center gap-3">
              {isEditing ? (
                <>
                  <button
                    className="btn"
                    onClick={handleSave}
                    style={{
                      backgroundColor: '#28a745',
                      color: '#fff',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontFamily: 'Quicksand, sans-serif',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#218838')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#28a745')}
                  >
                    Lưu
                  </button>
                  <button
                    className="btn"
                    onClick={() => setIsEditing(false)}
                    style={{
                      backgroundColor: '#6c757d',
                      color: '#fff',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontFamily: 'Quicksand, sans-serif',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#5a6268')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6c757d')}
                  >
                    Hủy
                  </button>
                </>
              ) : (
                <button
                  className="btn"
                  onClick={() => setIsEditing(true)}
                  style={{
                    backgroundColor: '#007bff',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontFamily: 'Quicksand, sans-serif',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
                >
                  Sửa thông tin
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;