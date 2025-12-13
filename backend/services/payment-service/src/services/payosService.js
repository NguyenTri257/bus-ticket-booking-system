// PayOS payment service
// Handles integration with PayOS API
// PCI-DSS: Never store card data

const axios = require('axios');

const PAYOS_API_URL = process.env.PAYOS_API_URL || 'https://sandbox-api.payos.vn';
const PAYOS_API_KEY = process.env.PAYOS_API_KEY;

async function createPayment({ amount, currency, description, returnUrl, cancelUrl, metadata }) {
  // Only send required info to PayOS, never store card data
  const payload = {
    amount,
    currency,
    description,
    returnUrl,
    cancelUrl,
    metadata,
  };
  const headers = {
    'Authorization': `Bearer ${PAYOS_API_KEY}`,
    'Content-Type': 'application/json',
  };
  const response = await axios.post(`${PAYOS_API_URL}/v1/payments`, payload, { headers });
  return response.data;
}

module.exports = {
  createPayment,
};
