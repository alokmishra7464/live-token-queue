// Express app: middleware + routes + error handler
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const tokenRoutes = require('./routes/tokenRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);
module.exports = app;
