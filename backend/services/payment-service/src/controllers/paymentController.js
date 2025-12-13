// Payment controller for PayOS integration
const payosService = require('../services/payosService');

// POST /payments
async function createPayment(req, res) {
  try {
    const { amount, currency, description, returnUrl, cancelUrl, metadata } = req.body;
    // Validate input (no card data allowed)
    if (!amount || !currency || !description || !returnUrl || !cancelUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const payment = await payosService.createPayment({
      amount,
      currency,
      description,
      returnUrl,
      cancelUrl,
      metadata,
    });
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  createPayment,
  async webhook(req, res) {
    const { verifyPayOSSignature } = require('../utils/webhookVerifier');
    const paymentStatusService = require('../services/paymentStatusService');
    const PAYOS_WEBHOOK_SECRET = process.env.PAYOS_WEBHOOK_SECRET || 'sandbox_secret';
    if (!verifyPayOSSignature(req, PAYOS_WEBHOOK_SECRET)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    const { paymentId, status, gatewayRef } = req.body;
    if (!paymentId || !status) {
      return res.status(400).json({ error: 'Missing paymentId or status' });
    }
    // Idempotency: check if already processed
    const existing = paymentStatusService.getPayment(paymentId);
    if (existing && existing.status === status) {
      return res.status(200).json({ message: 'Already processed' });
    }
    // Update status
    paymentStatusService.updatePaymentStatus(paymentId, status, gatewayRef);
    // Notify booking-service (stub)
    if (status === 'completed') {
      // TODO: call booking-service API
    }
    // Notify notification-service (stub)
    // TODO: call notification-service API
    return res.status(200).json({ message: 'Webhook processed' });
  },
};
