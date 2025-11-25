import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyPets = () => {
  const [pets, setPets] = useState([]);
  const [newPet, setNewPet] = useState({ name: '', type: 'cat', ageRange: 'under_2_months' });
  const [editPet, setEditPet] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/pets', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => setPets(response.data))
      .catch(error => console.error('Error fetching pets:', error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (editPet) {
      setEditPet(prev => ({ ...prev, [name]: value }));
    } else {
      setNewPet(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddPet = () => {
    const token = localStorage.getItem('token');
    axios.post('http://localhost:5000/api/pets', newPet, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setPets([...pets, response.data]);
        setNewPet({ name: '', type: 'cat', ageRange: 'under_2_months' });
        setShowAddForm(false);
        alert('Thú cưng đã được thêm!');
      })
      .catch(error => console.error('Error adding pet:', error));
  };

  const handleEditPet = (pet) => {
    setEditPet({ ...pet });
  };

  const handleSaveEdit = () => {
    const token = localStorage.getItem('token');
    axios.put(`http://localhost:5000/api/pets/${editPet._id}`, editPet, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setPets(pets.map(p => p._id === editPet._id ? response.data : p));
        setEditPet(null);
        alert('Thú cưng đã được cập nhật!');
      })
      .catch(error => console.error('Error updating pet:', error));
  };

  const handleDeletePet = (petId) => {
    const token = localStorage.getItem('token');
    if (window.confirm('Bạn có chắc muốn xóa thú cưng này?')) {
      axios.delete(`http://localhost:5000/api/pets/${petId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(() => {
          setPets(pets.filter(p => p._id !== petId));
          alert('Thú cưng đã được xóa!');
        })
        .catch(error => console.error('Error deleting pet:', error));
    }
  };

  // Hàm chuyển đổi ageRange thành định dạng dễ đọc
  const formatAgeRange = (ageRange) => {
    const ageMap = {
      under_2_months: 'Dưới 2 tháng tuổi',
      '2_to_6_months': '2-6 tháng tuổi',
      '6_to_12_months': '6-12 tháng tuổi',
      '1_to_7_years': '1-7 năm tuổi',
      over_7_years: 'Trên 7 năm tuổi'
    };
    return ageMap[ageRange] || ageRange;
  };

  return (
    <div className="container mt-5" style={{ paddingTop: '30px' }}>
      <h2 className="mb-4 text-center" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 'bold' }}>
        Thú cưng của tôi
      </h2>
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card p-4 shadow-sm mb-4" style={{ borderRadius: '15px', border: 'none', backgroundColor: '#f8f9fa' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 style={{ fontFamily: 'Quicksand, sans-serif', margin: 0 }}>
                Thêm thú cưng mới
              </h4>
              <button
                className="btn"
                onClick={() => setShowAddForm(!showAddForm)}
                style={{
                  backgroundColor: showAddForm ? '#6c757d' : '#28a745',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontFamily: 'Quicksand, sans-serif',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = showAddForm ? '#5a6268' : '#218838')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = showAddForm ? '#6c757d' : '#28a745')}
              >
                {showAddForm ? 'Ẩn form' : 'Thêm thú cưng'}
              </button>
            </div>
            {showAddForm && (
              <>
                <div className="mb-3">
                  <label className="form-label" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                    Tên thú cưng
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={newPet.name}
                    onChange={handleChange}
                    style={{ borderRadius: '8px', border: '1px solid #ced4da', fontFamily: 'Quicksand, sans-serif' }}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                    Loại
                  </label>
                  <select
                    className="form-control"
                    name="type"
                    value={newPet.type}
                    onChange={handleChange}
                    style={{ borderRadius: '8px', border: '1px solid #ced4da', fontFamily: 'Quicksand, sans-serif' }}
                  >
                    <option value="cat">Mèo</option>
                    <option value="dog">Chó</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                    Khoảng tuổi
                  </label>
                  <select
                    className="form-control"
                    name="ageRange"
                    value={newPet.ageRange}
                    onChange={handleChange}
                    style={{ borderRadius: '8px', border: '1px solid #ced4da', fontFamily: 'Quicksand, sans-serif' }}
                  >
                    <option value="under_2_months">Dưới 2 tháng tuổi</option>
                    <option value="2_to_6_months">2-6 tháng tuổi</option>
                    <option value="6_to_12_months">6-12 tháng tuổi</option>
                    <option value="1_to_7_years">1-7 năm tuổi</option>
                    <option value="over_7_years">Trên 7 năm tuổi</option>
                  </select>
                </div>
                <div className="d-flex justify-content-center">
                  <button
                    className="btn"
                    onClick={handleAddPet}
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
                    Thêm
                  </button>
                </div>
              </>
            )}
          </div>

          <h4 className="mb-3 text-center" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            Danh sách thú cưng
          </h4>
          {pets.length === 0 ? (
            <p className="text-center" style={{ fontFamily: 'Quicksand, sans-serif' }}>
              Chưa có thú cưng nào được thêm.
            </p>
          ) : (
            pets.map((pet) => (
              <div
                key={pet._id}
                className="card p-3 mb-3 shadow-sm"
                style={{ borderRadius: '10px', border: 'none', backgroundColor: '#ffffff' }}
              >
                {editPet && editPet._id === pet._id ? (
                  <>
                    <div className="mb-3">
                      <label className="form-label" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                        Tên thú cưng
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={editPet.name}
                        onChange={handleChange}
                        style={{ borderRadius: '8px', border: '1px solid #ced4da', fontFamily: 'Quicksand, sans-serif' }}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                        Loại
                      </label>
                      <select
                        className="form-control"
                        name="type"
                        value={editPet.type}
                        onChange={handleChange}
                        style={{ borderRadius: '8px', border: '1px solid #ced4da', fontFamily: 'Quicksand, sans-serif' }}
                      >
                        <option value="cat">Mèo</option>
                        <option value="dog">Chó</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                        Khoảng tuổi
                      </label>
                      <select
                        className="form-control"
                        name="ageRange"
                        value={editPet.ageRange}
                        onChange={handleChange}
                        style={{ borderRadius: '8px', border: '1px solid #ced4da', fontFamily: 'Quicksand, sans-serif' }}
                      >
                        <option value="under_2_months">Dưới 2 tháng tuổi</option>
                        <option value="2_to_6_months">2-6 tháng tuổi</option>
                        <option value="6_to_12_months">6-12 tháng tuổi</option>
                        <option value="1_to_7_years">1-7 năm tuổi</option>
                        <option value="over_7_years">Trên 7 năm tuổi</option>
                      </select>
                    </div>
                    <div className="d-flex justify-content-center gap-3">
                      <button
                        className="btn"
                        onClick={handleSaveEdit}
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
                        onClick={() => setEditPet(null)}
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
                    </div>
                  </>
                ) : (
                  <>
                    <h5 style={{ fontFamily: 'Quicksand, sans-serif', marginBottom: '10px' }}>
                      {pet.name}
                    </h5>
                    <p style={{ fontFamily: 'Quicksand, sans-serif', margin: 0 }}>
                      Loại: {pet.type === 'cat' ? 'Mèo' : pet.type === 'dog' ? 'Chó' : 'Khác'}
                    </p>
                    <p style={{ fontFamily: 'Quicksand, sans-serif', margin: 0 }}>
                      Khoảng tuổi: {formatAgeRange(pet.ageRange)}
                    </p>
                    <div className="d-flex justify-content-center gap-3 mt-3">
                      <button
                        className="btn"
                        onClick={() => handleEditPet(pet)}
                        style={{
                          backgroundColor: '#ffc107',
                          color: '#000',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontFamily: 'Quicksand, sans-serif',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0a800')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffc107')}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn"
                        onClick={() => handleDeletePet(pet._id)}
                        style={{
                          backgroundColor: '#dc3545',
                          color: '#fff',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontFamily: 'Quicksand, sans-serif',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c82333')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#dc3545')}
                      >
                        Xóa
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPets;