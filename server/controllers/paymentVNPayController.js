const moment = require('moment');
const crypto = require('crypto');
const querystring = require('qs');
const Booking = require('../models/Booking');

// --------------------------------------------------------------------------
// HÀM 1: TẠO URL THANH TOÁN
// --------------------------------------------------------------------------
exports.createPaymentUrl = (paymentData) => {
    
    // 1. LẤY BIẾN MÔI TRƯỜNG VÀ DỮ LIỆU
    const vnp_TmnCode = process.env.VNP_TMNCODE;
    const vnp_HashSecret = process.env.VNP_HASHSECRET;
    const vnp_Url = process.env.VNP_URL;
    const vnp_ReturnUrl = process.env.VNP_RETURN_URL;

    const { amount, orderId, ipAddr } = paymentData;
    const createDate = moment(new Date()).format('YYYYMMDDHHmmss');
    
    // Chuẩn hóa IPv6 localhost (::1) về IPv4 127.0.0.1
    const clientIp = (!ipAddr || typeof ipAddr !== 'string')
        ? '127.0.0.1'
        : (ipAddr.includes(':') ? '127.0.0.1' : ipAddr);

    // 2. TẠO OBJETC CÁC THAM SỐ GỐC (RAW)
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = `Thanh toan dat lich ${orderId}`;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = vnp_ReturnUrl;
    vnp_Params['vnp_IpAddr'] = clientIp;
    vnp_Params['vnp_CreateDate'] = createDate;

    // 3. HÀM TẠO SIGN DATA THEO CHUẨN VNPAY: sort asc, encode value + thay %20 -> '+'
    const buildSignData = (obj) => {
        const keys = Object.keys(obj).sort();
        return keys.map(k => {
            const value = obj[k] === null || obj[k] === undefined ? '' : String(obj[k]);
            return k + '=' + encodeURIComponent(value).replace(/%20/g, '+');
        }).join('&');
    };

    // 4. TẠO SIGNATURE
    const signData = buildSignData(vnp_Params);
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const vnp_SecureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (process.env.NODE_ENV !== 'production') {
        console.log('[VNPay][create] signData =', signData);
        console.log('[VNPay][create] hash =', vnp_SecureHash);
    }

    // 5. TẠO URL THANH TOÁN (tham số chưa encode -> để qs encode)
    const paramsForUrl = { ...vnp_Params, vnp_SecureHash, vnp_SecureHashType: 'SHA512' };
    const paymentUrl = vnp_Url + '?' + querystring.stringify(paramsForUrl, { encode: true });
    
    return paymentUrl;
};

// Tạo URL thanh toán VNPay phục vụ test qua Postman (không cần tạo booking)
exports.generatePaymentLink = async (req, res) => {
    try {
        const { amount, orderId } = req.body || {};
        if (!amount || !orderId) {
            return res.status(400).json({ message: 'amount và orderId là bắt buộc' });
        }
        const ipAddress =   req.headers['x-forwarded-for'] || 
                            req.connection?.remoteAddress ||
                            req.socket?.remoteAddress ||
                            (req.connection && req.connection.socket ? req.connection.socket.remoteAddress : null);
        const paymentUrl = exports.createPaymentUrl({ amount: Number(amount), orderId: String(orderId), ipAddr: ipAddress });

        // Trả kèm debug để đối chiếu khi cần
        if (process.env.NODE_ENV !== 'production') {
            const debugParams = {
                amount: Number(amount), orderId: String(orderId), ipAddr: ipAddress
            };
            return res.status(200).json({ code: '00', message: 'OK', data: paymentUrl, debug: debugParams });
        }

        return res.status(200).json({ code: '00', message: 'OK', data: paymentUrl });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi tạo link thanh toán', error: error?.message || String(error) });
    }
};

// --------------------------------------------------------------------------
// HÀM 2: XỬ LÝ KHI VNPAY TRẢ VỀ (vnpay_return)
// --------------------------------------------------------------------------
exports.vnpayReturn = async (req, res) => {
    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const vnp_HashSecret = process.env.VNP_HASHSECRET;
    const clientUrl = process.env.CLIENT_URL;

    const buildSignData = (obj) => {
        const keys = Object.keys(obj).sort();
        return keys.map(k => {
            const value = obj[k] === null || obj[k] === undefined ? '' : String(obj[k]);
            return k + '=' + encodeURIComponent(value).replace(/%20/g, '+');
        }).join('&');
    };

    const signData = buildSignData(vnp_Params);

    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (process.env.NODE_ENV !== 'production') {
        console.log('[VNPay][return] signData =', signData);
        console.log('[VNPay][return] secureHash(received) =', secureHash);
        console.log('[VNPay][return] signed(computed) =', signed);
    }

    const orderId = vnp_Params['vnp_TxnRef'];
    const vnp_ResponseCode = vnp_Params['vnp_ResponseCode'];
    
    let redirectUrl = `${clientUrl}/payment-result?orderId=${orderId}`;

    if (secureHash === signed) {
        try {
            if (vnp_ResponseCode == '00') {
                await Booking.findByIdAndUpdate(orderId, { paymentStatus: 'success',paymentMethod: 'vnpay' });
                redirectUrl += '&success=true&message=Payment successful';
            } else {
                await Booking.findByIdAndUpdate(orderId, { paymentStatus: 'failed', paymentMethod: 'vnpay' });
                redirectUrl += '&success=false&message=Payment failed';
            }
        } catch (error) {
            redirectUrl += '&success=false&message=Error updating order database';
        }
    } else {
        redirectUrl += '&success=false&message=Invalid signature';
    }
    
    res.redirect(redirectUrl);
};

// --------------------------------------------------------------------------
// HÀM 3: XỬ LÝ IPN (LOGIC TƯƠNG TỰ HÀM 2)
// --------------------------------------------------------------------------
exports.vnpayIPN = async (req, res) => {
    try {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        const vnp_HashSecret = process.env.VNP_HASHSECRET;

        const buildSignData = (obj) => {
            const keys = Object.keys(obj).sort();
            return keys.map(k => {
                const value = obj[k] === null || obj[k] === undefined ? '' : String(obj[k]);
                return k + '=' + encodeURIComponent(value).replace(/%20/g, '+');
            }).join('&');
        };

        const signData = buildSignData(vnp_Params);
        
        let hmac = crypto.createHmac("sha512", vnp_HashSecret);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (process.env.NODE_ENV !== 'production') {
            console.log('[VNPay][ipn] signData =', signData);
            console.log('[VNPay][ipn] secureHash(received) =', secureHash);
            console.log('[VNPay][ipn] signed(computed) =', signed);
        }

        let orderId = vnp_Params['vnp_TxnRef'];
        let vnp_ResponseCode = vnp_Params['vnp_ResponseCode'];

        if (secureHash === signed) {
            const booking = await Booking.findById(orderId);
            if (booking && booking.paymentStatus === 'pending') {
                if (vnp_ResponseCode == '00') {
                    await Booking.findByIdAndUpdate(orderId, { paymentStatus: 'success', paymentMethod: 'vnpay' });
                } else {
                    await Booking.findByIdAndUpdate(orderId, { paymentStatus: 'failed', paymentMethod: 'vnpay' });
                }
                res.status(200).json({ RspCode: '00', Message: 'Success' });
            } else {
                res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
            }
        } else {
            res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
        }
    } catch (error) {
        res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
};