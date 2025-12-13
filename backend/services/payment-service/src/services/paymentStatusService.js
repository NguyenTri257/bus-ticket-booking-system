// services/paymentStatusService.js
// In-memory store for demo; replace with DB in production
const payments = new Map();

function getPayment(id) {
  return payments.get(id);
}

function setPayment(id, data) {
  payments.set(id, data);
}

function updatePaymentStatus(id, status, gatewayRef) {
  const payment = payments.get(id) || {};
  payment.status = status;
  payment.gatewayRef = gatewayRef;
  payments.set(id, payment);
}

module.exports = {
  getPayment,
  setPayment,
  updatePaymentStatus,
};
