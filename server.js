require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
// serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);

// health
app.get('/api/health', (req, res) => res.json({ ok: true, timestamp: Date.now() }));

// error handlers
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
