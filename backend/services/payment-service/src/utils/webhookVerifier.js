// utils/webhookVerifier.js
const crypto = require('crypto');

function verifyPayOSSignature(req, secret) {
  const signature = req.headers['x-payos-signature'];
  if (!signature) return false;
  const payload = JSON.stringify(req.body);
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return signature === expected;
}

module.exports = { verifyPayOSSignature };
