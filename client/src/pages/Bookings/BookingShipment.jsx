// BookingShipment.jsx – PHIÊN BẢN CUỐI CÙNG, ĐÚNG NHƯ BẠN MUỐN

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LoadScript, GoogleMap, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import toast, { Toaster } from 'react-hot-toast';
import './BookingShipment.css';

const containerStyle = { width: '100%', height: '320px', borderRadius: '12px' };
const center = { lat: 10.7769, lng: 106.7009 };

const BookingShipment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]); // Chỉ dịch vụ vận chuyển
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distanceInfo, setDistanceInfo] = useState(null);

  const [formData, setFormData] = useState({
    petId: '',
    serviceId: '',
    bookingDate: new Date().toISOString().split('T')[0],
    pickupAddress: '',
    dropoffAddress: '',
    notes: '',
    paymentMethod: 'cod'
  });

  // Load pets + chỉ dịch vụ vận chuyển
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [petRes, allServicesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/pets', config),
          axios.get('http://localhost:5000/api/services', config)
        ]);

        // Lọc chỉ dịch vụ vận chuyển (category = 4)
        const shipmentServices = allServicesRes.data.filter(service =>
          service.category === 4 ||
          (service.category && (service.category._id === 4 || String(service.category) === '4'))
        );

        setPets(petRes.data);
        setServices(shipmentServices);

        if (petRes.data.length > 0) {
          setFormData(prev => ({ ...prev, petId: petRes.data[0]._id }));
        }
        if (shipmentServices.length > 0) {
          setFormData(prev => ({ ...prev, serviceId: shipmentServices[0]._id }));
        }
      } catch (err) {
        toast.error('Không tải được dữ liệu');
      }
    };
    loadData();
  }, []);

  // Tính khoảng cách realtime
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.pickupAddress && formData.dropoffAddress) {
        try {
          const res = await axios.post('http://localhost:5000/api/maps/calculate', {
            origin: formData.pickupAddress,
            destination: formData.dropoffAddress
          });

          const km = res.data.distanceValue ? (res.data.distanceValue / 1000) : 0;
          const distanceRounded = Math.round(km * 10) / 10; // Làm tròn 1 chữ số

          setDistanceInfo({
            distance: `${distanceRounded} km`,
            duration: res.data.durationText,
            distanceKm: distanceRounded
          });
        } catch (err) {
          setDistanceInfo(null);
          toast.error('Không tính được khoảng cách');
        }
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [formData.pickupAddress, formData.dropoffAddress]);

  const selectedService = services.find(s => s._id === formData.serviceId);

  // TÍNH TIỀN ĐÚNG Ý BẠN: price × km (chỉ thế thôi!)
  const calculateTotal = () => {
    if (!selectedService || !distanceInfo?.distanceKm) return 0;
    const total = selectedService.price * distanceInfo.distanceKm;
    return Math.round(total); // Làm tròn số đẹp
  };

  const directionsCallback = useCallback((response) => {
    if (response !== null && response.status === 'OK') {
      setDirectionsResponse(response);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!distanceInfo) return toast.error('Vui lòng chờ tính khoảng cách');

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/bookings/shipment', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Đặt vận chuyển thành công!');

      if (res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        setTimeout(() => navigate('/my-bookings'), 2000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đặt thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <LoadScript googleMapsApiKey="ANYTHING_HERE">
        <div className="container py-5">
          <h2 className="text-center mb-5 title-shipment">
            Dịch Vụ Vận Chuyển Thú Cưng
          </h2>

          <div className="row g-4">
            {/* FORM */}
            <div className="col-lg-7">
              <div className="card shadow-lg border-0">
                <div className="card-body p-4">
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Điểm đón</label>
                        <input type="text" className="form-control form-control-lg" placeholder="Nhà bạn ở đâu?" required
                          value={formData.pickupAddress}
                          onChange={e => setFormData({ ...formData, pickupAddress: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Điểm trả</label>
                        <input type="text" className="form-control form-control-lg" placeholder="Bé đi đâu?" required
                          value={formData.dropoffAddress}
                          onChange={e => setFormData({ ...formData, dropoffAddress: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Gói vận chuyển */}
                    <div className="my-4">
                      <label className="form-label fw-bold">Chọn gói vận chuyển</label>
                      {services.length === 0 ? (
                        <p className="text-muted">Không có dịch vụ vận chuyển nào</p>
                      ) : (
                        <div className="row g-4">
                          {services.map(sv => {
                            const isSelected = formData.serviceId === sv._id;
                            return (
                              <div key={sv._id} className="col-6">
                                <div
                                  className={`card h-100 text-center p-4 cursor-pointer border ${isSelected ? 'border-primary shadow-lg' : 'border-light'}`}
                                  style={{ borderWidth: isSelected ? '4px' : '2px' }}
                                  onClick={() => setFormData({ ...formData, serviceId: sv._id })}
                                >
                                  <div className="fs-1 mb-3">
                                    {sv.name.toLowerCase().includes('nhanh') || sv.name.toLowerCase().includes('express') ? 'Rocket' : 'Truck'}
                                  </div>
                                  <h5 className="fw-bold text-primary">{sv.name}</h5>
                                  <h4 className="text-danger fw-bold">
                                    {sv.price.toLocaleString()}đ/km
                                  </h4>
                                  <small className="text-muted">
                                    {sv.description || 'Vận chuyển an toàn, nhanh chóng'}
                                  </small>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Thú cưng</label>
                        <select className="form-select form-select-lg" required value={formData.petId}
                          onChange={e => setFormData({ ...formData, petId: e.target.value })}>
                          <option value="">Chọn bé yêu</option>
                          {pets.map(p => (
                            <option key={p._id} value={p._id}>{p.name} ({p.type})</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Ngày vận chuyển</label>
                        <input type="date" className="form-control form-control-lg" required
                          value={formData.bookingDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={e => setFormData({ ...formData, bookingDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-bold">Ghi chú cho tài xế</label>
                      <textarea className="form-control" rows="3" placeholder="Ví dụ: Bé hay say xe, cần đi chậm..."
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>

                    {/* HIỂN THỊ TỔNG TIỀN */}
                    {distanceInfo && selectedService && (
                      <div className="alert alert-warning p-4 rounded-3 text-center mb-4" style={{background: '#fff8e1'}}>
                        <h5 className="mb-3">
                          Khoảng cách: <strong className="text-primary">{distanceInfo.distance}</strong>
                        </h5>
                        <h5 className="mb-3">
                          Thời gian ước tính: <strong>{distanceInfo.duration}</strong>
                        </h5>
                        <h2 className="text-danger fw-bold">
                          TỔNG TIỀN: {calculateTotal().toLocaleString('vi-VN')} ₫
                        </h2>
                        <small className="text-muted">
                          ({selectedService.price.toLocaleString()}đ × {distanceInfo.distanceKm}km)
                        </small>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      className="btn btn-danger btn-lg w-100 fw-bold py-3" 
                      disabled={loading || !distanceInfo || !selectedService}
                    >
                      {loading ? 'Đang xử lý...' : 'XÁC NHẬN ĐẶT XE NGAY'}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* MAP */}
            <div className="col-lg-5">
              <div className="card shadow-lg border-0 sticky-top" style={{ top: '20px' }}>
                <div className="card-body p-3">
                  <h5 className="text-center mb-3">Lộ trình dự kiến</h5>
                  <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={11}>
                    {formData.pickupAddress && formData.dropoffAddress && !directionsResponse && (
                      <DirectionsService
                        options={{ origin: formData.pickupAddress, destination: formData.dropoffAddress, travelMode: 'DRIVING' }}
                        callback={directionsCallback}
                      />
                    )}
                    {directionsResponse && <DirectionsRenderer options={{ directions: directionsResponse }} />}
                  </GoogleMap>
                  {!formData.pickupAddress || !formData.dropoffAddress ? (
                    <div className="text-center text-muted mt-3">
                      <p>Nhập địa chỉ để xem lộ trình</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </LoadScript>
    </>
  );
};

export default BookingShipment;