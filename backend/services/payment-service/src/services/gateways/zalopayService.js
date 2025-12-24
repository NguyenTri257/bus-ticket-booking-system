
const axios = require('axios');
const crypto = require('crypto');

/**
 * ZaloPay yêu cầu app_trans_id = yymmdd_xxxx
 */
function generateAppTransId() {
  const now = new Date();
  const yymmdd =
    String(now.getFullYear()).slice(2) +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  return `${yymmdd}_${Date.now()}`;
}

function signHmacSHA256(key, data) {
  return crypto.createHmac('sha256', key).update(data).digest('hex');
}

/**
 * Tạo payment ZaloPay (SANDBOX)
 */
async function createZaloPayPayment({ amount, description, bookingId }) {
  try {
    const qs = require('qs');
    const appId = process.env.ZALOPAY_APP_ID;
    const key1 = process.env.ZALOPAY_KEY1;
    const endpoint = process.env.ZALOPAY_CREATE_URL;

    // Kiểm tra amount
    const finalAmount = Number(amount);
    if (!Number.isInteger(finalAmount) || finalAmount <= 0) {
      throw new Error('Invalid ZaloPay amount');
    }

    const app_trans_id = generateAppTransId();
    const app_time = Date.now();
    const app_user = 'guest';

    // embed_data: JSON string (dùng để map bookingId và redirecturl)
    const redirectUrl = process.env.ZALOPAY_REDIRECT_URL || 'http://localhost:5173/payment-result';
    const embed_data = JSON.stringify({ 
      bookingId, 
      redirecturl: redirectUrl
    });
    // item: bắt buộc là JSON array string
    const item = JSON.stringify([{ bookingId, amount: finalAmount }]);

    // MAC phải ký sau khi dữ liệu đã final
    const hmacInput = [
      appId,
      app_trans_id,
      app_user,
      finalAmount,
      app_time,
      embed_data,
      item
    ].join('|');
    const mac = signHmacSHA256(key1, hmacInput);

    // callback_url: URL public để ZaloPay gọi webhook (không dùng localhost)
    const callbackUrl = process.env.ZALOPAY_CALLBACK_URL || 'https://4zv68s3d-3005.asse.devtunnels.ms/api/payment/zalopay-webhook';
    const payload = {
      app_id: appId,
      app_trans_id,
      app_user,
      amount: finalAmount,
      app_time,
      embed_data,
      item,
      description,
      mac,
      redirect_url: `${redirectUrl}?bookingId=${bookingId}`
    };
    if (callbackUrl) {
      payload.callback_url = callbackUrl;
    }

    // Sử dụng x-www-form-urlencoded
    console.log('[ZaloPay] payload gửi lên:', payload);
    const response = await axios.post(endpoint, qs.stringify(payload), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const data = response.data;
    if (data.return_code !== 1) {
      console.error('[ZaloPay] response error:', data);
      return {
        success: false,
        message: data.return_message || 'ZaloPay create order failed',
        raw: data
      };
    }
    return {
      success: true,
      payUrl: data.order_url,
      zpTransToken: data.zp_trans_token,
      appTransId: app_trans_id,
      raw: data
    };
  } catch (err) {
    console.error('[ZaloPay] create payment error:', err.response?.data || err);
    return {
      success: false,
      message: 'ZaloPay create payment exception',
      error: err.message
    };
  }
}

/**
 * Webhook callback từ ZaloPay
 */
async function handleWebhook(req, res) {
  const key2 = process.env.ZALOPAY_KEY2;

  const { data, mac: receivedMac } = req.body;

  const calculatedMac = signHmacSHA256(key2, data);

  if (receivedMac !== calculatedMac) {
    console.error('[ZaloPay] Invalid MAC');
    return res.json({ return_code: -1, return_message: 'invalid mac' });
  }

  const parsedData = JSON.parse(data);
  const embedData = JSON.parse(parsedData.embed_data || '{}');
  const bookingId = embedData.bookingId;

  /**
   * parsedData.return_code:
   * 1 = thanh toán thành công
   * 2 = thất bại
   */
  if (parsedData.return_code === 1) {
    console.log('[ZaloPay] Payment success for booking:', bookingId);

    // TODO:
    // Update bảng bookings:
    // payment_status = 'paid'
    // status = 'confirmed'
    // paid_at = NOW()
  }

  return res.json({ return_code: 1, return_message: 'success' });
}

module.exports = {
  createZaloPayPayment,
  handleWebhook
};
