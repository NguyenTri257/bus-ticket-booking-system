// Payment-service entrypoint
const express = require('express');
const bodyParser = require('body-parser');
const paymentController = require('./controllers/paymentController');

const app = express();
app.use(bodyParser.json());

// POST /payments
app.post('/payments', paymentController.createPayment);

// POST /payments/webhook
app.post('/payments/webhook', paymentController.webhook);

// Health check
app.get('/health', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});
