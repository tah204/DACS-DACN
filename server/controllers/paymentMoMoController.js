const crypto = require('crypto');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const Booking = require('../models/Booking');

// --------------------------------------------------------------------------
// HÀM 1: TẠO URL THANH TOÁN (GỬI CHO MOMO)
// --------------------------------------------------------------------------
exports.createMoMoPayment = async (paymentData) => {

  // 1. LẤY BIẾN MÔI TRƯỜNG VÀ DỮ LIỆU
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;
  const redirectUrl = process.env.MOMO_RETURN_URL; 
  const ipnUrl = process.env.MOMO_IPN_URL || process.env.MOMO_NOTIFY_URL; 
  const apiEndpoint = process.env.MOMO_API_ENDPOINT;

  if (!partnerCode || !accessKey || !secretKey || !redirectUrl || !ipnUrl || !apiEndpoint) {
    throw new Error('Thiếu cấu hình MoMo (.env): cần MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY, MOMO_RETURN_URL, MOMO_IPN_URL/MOMO_NOTIFY_URL, MOMO_API_ENDPOINT');
  }

  const { amount, bookingId } = paymentData;
  
  // 2. CHUẨN BỊ DỮ LIỆU GỐC (RAW)
  const orderInfo = `Thanh toan dat lich ${bookingId}`;
  const requestId = uuidv4(); 
  const orderId = `${bookingId}:${requestId}`; 
    const requestType = "payWithATM";
  const extraData = ""; 

    // --- [SỬA LỖI] BẮT BUỘC SẮP XẾP A-B VÀ THÊM requestType ---
  // 3. TẠO CHUỖI ĐỂ HASH (rawSignature)
  const rawSignature = 
        `accessKey=${accessKey}` +
        `&amount=${amount}` +
        `&extraData=${extraData}` +
    `&ipnUrl=${ipnUrl}` +
    `&orderId=${orderId}` +
    `&orderInfo=${orderInfo}` +
        `&partnerCode=${partnerCode}` +
    `&redirectUrl=${redirectUrl}` +
    `&requestId=${requestId}` +
    `&requestType=${requestType}`; // <-- Lỗi 2: Thiếu trường này
        // --- [KẾT THÚC SỬA LỖI] ---

  // 4. TẠO CHỮ KÝ (signature)
  const hmac = crypto.createHmac('sha256', secretKey); // Sửa: Dùng secretKey
  const signature = hmac.update(rawSignature).digest('hex');

  // 5. TẠO BODY GỬI ĐẾN MOMO
  const requestBody = {
    partnerCode,
    accessKey,
    requestId,
    amount: amount.toString(),
    orderId,
    orderInfo,
    redirectUrl, // Sửa: tên biến là redirectUrl
    ipnUrl, // Sửa: tên biến là ipnUrl
    extraData,
    requestType,
    signature,
    lang: 'vi'
  };

  // 6. GỌI API MOMO
  try {
    const response = await axios.post(apiEndpoint, requestBody);
    
        // MoMo trả về lỗi trong body
        if (response.data.resultCode !== 0) {
            console.error("MoMo trả về lỗi:", response.data.message);
            throw new Error(response.data.message);
        }
    
    return response.data.payUrl; 
    
  } catch (error) {
    // Ghi log lỗi từ MoMo (nếu có)
    console.error("Lỗi khi gọi API MoMo:", error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.message || "Không thể tạo thanh toán MoMo.");
  }
};

// --------------------------------------------------------------------------
// HÀM 1B: API tạo link thanh toán cho booking hiện có (POST /create)
// --------------------------------------------------------------------------
exports.createMoMoPaymentLink = async (req, res) => {
    // ... (Hàm này của sếp đã TỐT, giữ nguyên logic) ...
  try {
    const { amount, bookingId } = req.body;
    if (!bookingId || !amount) {
      return res.status(400).json({ message: 'Thiếu bookingId hoặc amount' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking không tồn tại' });
    }

    const finalAmount = Number(amount) || Number(booking.totalAmount) || 0;
    if (!finalAmount) {
      return res.status(400).json({ message: 'Số tiền không hợp lệ' });
    }

    const payUrl = await exports.createMoMoPayment({ amount: finalAmount, bookingId });
    return res.status(200).json({ code: '00', message: 'OK', data: payUrl });
 s } catch (error) {
    console.error('Error in createMoMoPaymentLink:', error.message || error);
    return res.status(500).json({ message: 'Không thể tạo link thanh toán MoMo', error: error.message || error });
 }
};

// --------------------------------------------------------------------------
// HÀM 2: XỬ LÝ KHI MOMO TRẢ VỀ (momo_return - GET)
// --------------------------------------------------------------------------
exports.momoReturn = async (req, res) => {
  const secretKey = process.env.MOMO_SECRET_KEY; // Sửa: dùng secretKey
  const clientUrl = process.env.CLIENT_URL;
  const accessKey = process.env.MOMO_ACCESS_KEY;

  const queryParams = req.query;
  const signature = queryParams.signature;

    // --- [SỬA LỖI] BẮT BUỘC SẮP XẾP A-B ---
    // 2. TẠO CHUỖI ĐỂ HASH (rawSignature)
    // Các trường VNPAY trả về (theo docs)
  const rawSignature = 
        `accessKey=${accessKey}` +
        `&amount=${queryParams.amount}` +
        `&extraData=${queryParams.extraData}` +
    `&message=${queryParams.message}` +
    `&orderId=${queryParams.orderId}` +
    `&orderInfo=${queryParams.orderInfo}` +
    `&orderType=${queryParams.orderType}` +
        `&partnerCode=${queryParams.partnerCode}` +
    `&payType=${queryParams.payType}` +
    `&requestId=${queryParams.requestId}` +
    `&responseTime=${queryParams.responseTime}` +
        `&resultCode=${queryParams.resultCode}` + // Sửa: resultCode
    `&transId=${queryParams.transId}`;
    // --- [KẾT THÚC SỬA LỖI] ---

  // 3. TẠO CHỮ KÝ ĐỂ SO SÁNH
  const hmac = crypto.createHmac('sha256', secretKey); // Sửa: dùng secretKey
  const signed = hmac.update(rawSignature).digest('hex');

  const bookingId = queryParams.orderId.split(':')[0]; 
  let redirectUrl = `${clientUrl}/payment-result?orderId=${bookingId}`;

  // 5. XÁC THỰC VÀ CẬP NHẬT
  if (signature === signed) {
    if (queryParams.resultCode == '0') {
      console.log(`(MoMo Return) Giao dịch ${bookingId} thành công.`);
      try {
        await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'success', paymentMethod: 'momo',paymentDetails: queryParams });
        redirectUrl += '&success=true&message=Payment successful';
      } catch (error) {
        console.error('Lỗi cập nhật CSDL (MoMo Return):', error);
        redirectUrl += '&success=false&message=Error updating database';
      }
    } else {
      console.log(`(MoMo Return) Giao dịch ${bookingId} thất bại.`);
      await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'failed' });
      redirectUrl += `&success=false&message=${queryParams.message}`;
    }
  } else {
    console.log('Chữ ký MoMo không hợp lệ (Return).');
        console.log('Chữ ký nhận được:', signature);
        console.log('Chữ ký tính toán:', signed);
        console.log('Chuỗi gốc đã ký:', rawSignature);
    redirectUrl += '&success=false&message=Invalid signature';
  }
  
  // 6. Redirect người dùng về React
  res.redirect(redirectUrl);
};

// --------------------------------------------------------------------------
// HÀM 3: XỬ LÝ IPN (momo_notify - POST)
// --------------------------------------------------------------------------
exports.momoNotify = async (req, res) => {
  
  const secretKey = process.env.MOMO_SECRET_KEY; // Sửa: dùng secretKey
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const bodyParams = req.body;
  const signature = bodyParams.signature;

    // --- [SỬA LỖI] BẮT BUỘC SẮP XẾP A-B ---
    // TẠO CHUỖI ĐỂ HASH (rawSignature)
  const rawSignature = 
        `accessKey=${accessKey}` +
        `&amount=${bodyParams.amount}` +
        `&extraData=${bodyParams.extraData}` +
    `&message=${bodyParams.message}` +
    `&orderId=${bodyParams.orderId}` +
    `&orderInfo=${bodyParams.orderInfo}` +
    `&orderType=${bodyParams.orderType}` +
        `&partnerCode=${bodyParams.partnerCode}` +
    `&payType=${bodyParams.payType}` +
    `&requestId=${bodyParams.requestId}` +
    `&responseTime=${bodyParams.responseTime}` +
        `&resultCode=${bodyParams.resultCode}` + // Sửa: resultCode
    `&transId=${bodyParams.transId}`;
    // --- [KẾT THÚC SỬA LỖI] ---

  // TẠO CHỮ KÝ ĐỂ SO SÁNH
  const hmac = crypto.createHmac('sha256', secretKey); // Sửa: dùng secretKey
  const signed = hmac.update(rawSignature).digest('hex');

  const bookingId = bodyParams.orderId.split(':')[0]; // Lấy lại bookingId gốc

  if (signature === signed) {
    try {
      const booking = await Booking.findById(bookingId);
      if (booking && booking.paymentStatus === 'pending') {
        if (bodyParams.resultCode == '0') {
          await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'success', paymentMethod: 'momo' });
          console.log(`(MoMo IPN) Cập nhật ${bookingId} thành công.`);
        } else {
          await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'failed', paymentMethod: 'momo' });
          console.log(`(MoMo IPN) Cập nhật ${bookingId} thất bại.`);
        }
      }
      // Phản hồi 204 cho MoMo biết đã nhận
      res.status(204).send();
    } catch (error) {
      console.error('Lỗi CSDL (MoMo IPN):', error);
      res.status(500).send(); // Báo lỗi 500 để MoMo thử lại
    }
  } else {
    console.log('Chữ ký MoMo không hợp lệ (IPN).');
    res.status(400).send(); // Báo lỗi 400 (Bad Request)
  }
};