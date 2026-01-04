const express = require('express');
require('dotenv').config();
const routes = require('./routes/routes');


const app = express();
// Cho phép nhận JSON lớn (ảnh base64)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(routes);

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
  console.log(`🚀 User Service running on port ${PORT}`);
});
