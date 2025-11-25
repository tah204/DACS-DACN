const axios = require('axios');
const Booking = require('../models/Booking'); // Import Booking model

// Resolve PayPal configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_MODE = (process.env.PAYPAL_MODE || 'sandbox').toLowerCase(); // 'sandbox' | 'live'
const DEFAULT_PAYPAL_ENDPOINT = PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
const PAYPAL_API_ENDPOINT = process.env.PAYPAL_API_ENDPOINT || DEFAULT_PAYPAL_ENDPOINT;
const PAYPAL_EXCHANGE_RATE = Number(process.env.PAYPAL_EXCHANGE_RATE || process.env.PAYPAL_USD_RATE || 0); // VND->USD

function assertPayPalConfig() {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
        throw new Error('PAYPAL_CLIENT_ID hoặc PAYPAL_SECRET chưa được cấu hình.');
    }
    try {
        // Validate URL shape early to avoid "Invalid URL"
        // new URL throws if invalid
        // eslint-disable-next-line no-new
        new URL(PAYPAL_API_ENDPOINT);
    } catch (_) {
        throw new Error(`PAYPAL_API_ENDPOINT không hợp lệ: ${PAYPAL_API_ENDPOINT}`);
    }
}

function convertVndToUsdString(vndAmount) {
    const amountVnd = Number(vndAmount || 0);
    const rate = Number.isFinite(PAYPAL_EXCHANGE_RATE) && PAYPAL_EXCHANGE_RATE > 0
        ? PAYPAL_EXCHANGE_RATE
        : 0.00004; // fallback ~1 USD ≈ 25,000 VND (configurable)
    const usd = amountVnd * rate;
    const normalized = Math.max(usd, 0.01); // PayPal minimum 0.01
    return normalized.toFixed(2);
}

/**
 * HÀM NỘI BỘ: Lấy Access Token (OAuth 2.0)
 * PayPal dùng Bearer Token, không dùng chữ ký (signature)
 */
async function getPayPalAccessToken() {
    try {
        assertPayPalConfig();
        const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
        
        const response = await axios.post(
            `${PAYPAL_API_ENDPOINT}/v1/oauth2/token`,
            'grant_type=client_credentials',
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${auth}`
                }
            }
        );
        
        return response.data.access_token;
    } catch (error) {
        const detail = error.response?.data || error.message;
        console.error('Lỗi khi lấy PayPal Access Token:', detail);
        throw new Error('Không thể xác thực với PayPal.');
    }
}

/**
 * HÀM 1: TẠO ĐƠN HÀNG (API: /create-order)
 * (React gọi hàm này ĐẦU TIÊN)
 */
exports.createOrder = async (req, res) => {
    try {
        const { bookingId } = req.body;
        
        // 1. Tìm booking trong CSDL
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Không tìm thấy booking.' });
        }
        
        // 2. Lấy Access Token
        const accessToken = await getPayPalAccessToken();
        
        // 3. Chuẩn bị dữ liệu gửi PayPal
        const orderData = {
            intent: 'CAPTURE', // Báo cho PayPal biết chúng ta muốn "Capture" (lấy tiền) ngay
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD',
                        value: convertVndToUsdString(booking.totalAmount)
                    },
                    description: `Thanh toan dat lich cho NekoKin: ${booking._id}`,
                    reference_id: booking._id.toString() // Lưu bookingId của chúng ta
                }
            ],
            application_context: {
                brand_name: 'NekoKin',
                shipping_preference: 'NO_SHIPPING',
                user_action: 'PAY_NOW'
            }
        };

        // 4. Gọi API Create Order của PayPal
        const response = await axios.post(
            `${PAYPAL_API_ENDPOINT}/v2/checkout/orders`,
            orderData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        // 5. Trả về orderID (của PayPal) cho React
        res.status(200).json({ orderID: response.data.id });

    } catch (error) {
        const detail = error.response?.data || error.message;
        console.error('Lỗi khi tạo đơn hàng PayPal:', detail);
        res.status(500).json({ message: 'Không thể tạo đơn hàng PayPal.', error: detail });
    }
};

/**
 * HÀM 2: HOÀN TẤT ĐƠN HÀNG (API: /capture-order)
 * (React gọi hàm này CUỐI CÙNG, sau khi user xác nhận)
 */
exports.captureOrder = async (req, res) => {
    try {
        const { orderID } = req.body; // Đây là orderID của PayPal (nhận từ React)

        // 1. Lấy Access Token
        const accessToken = await getPayPalAccessToken();

        // 2. Gọi API Capture Order của PayPal
        const response = await axios.post(
            `${PAYPAL_API_ENDPOINT}/v2/checkout/orders/${orderID}/capture`,
            {}, // Body rỗng
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        
        const captureData = response.data;

        // 3. Kiểm tra thanh toán thành công
        if (captureData.status === 'COMPLETED') {
            // 4. Lấy bookingId của chúng ta (lưu ở reference_id)
            const bookingId = captureData.purchase_units[0].reference_id;
            const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];
            const paypalTransactionId = capture?.id || captureData.id;
            
            // 5. Cập nhật CSDL
            await Booking.findByIdAndUpdate(bookingId, {
                paymentStatus: 'success',
                paypalTransactionId
            });

            console.log(`(PayPal) Giao dịch ${bookingId} thành công.`);
            res.status(200).json({ message: 'Thanh toán thành công!' });
        } else {
            // Thanh toán chưa hoàn tất (ví dụ: đang chờ xử lý)
            res.status(400).json({ message: 'Thanh toán PayPal chưa hoàn tất.', data: captureData });
        }

    } catch (error) {
        const detail = error.response?.data || error.message;
        console.error('Lỗi khi capture đơn hàng PayPal:', detail);
        res.status(500).json({ message: 'Không thể capture đơn hàng PayPal.', error: detail });
    }
};