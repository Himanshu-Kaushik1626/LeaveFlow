require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reimbursementRoutes = require('./routes/reimbursementRoutes');

connectDB();

const app = express();

// CORS
const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000']
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (dev)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.originalUrl}`);
        next();
    });
}

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reimbursements', reimbursementRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

module.exports = app;
