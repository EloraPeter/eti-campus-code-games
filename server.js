const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const passport = require('passport');
require('./config/passport')(passport);
const session = require('express-session');

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'x-paystack-signature']
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(session({ secret: process.env.SECRET_KEY, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session()); // Enables session-based login
app.use(session({
    secret: process.env.SECRET_KEY, // Keep this safe
    resave: false,             // Don't save session if unmodified
    saveUninitialized: false,  // Don't create session until something is stored
    rolling: true,             // <--- IMPORTANT: Resets the maxAge on every request
    cookie: {
        httpOnly: true,        // Prevents JS from reading the cookie (Security)
        secure: false,         // Set to true if using HTTPS
        maxAge: 7 * 24 * 60 * 60 * 1000 // <--- 7 days in milliseconds
    }
}));


const pool = require('./config/db');

// Routes
const authRoutes = require('./api/v1/routes/authRoutes');
const competitionRoutes = require('./api/v1/routes/competitionRoutes');
const paymentRoutes = require('./api/v1/routes/paymentRoutes');
const adminManageAuthRoutes = require('./api/admin/routes/authRoutes');
const adminManageCompetitionRoutes = require('./api/admin/routes/competitionRoutes');
const adminManagePaymentRoutes = require('./api/admin/routes/paymentRoutes');
const adminManagePermissionRoutes = require('./api/admin/routes/permissionRoutes');
const webhookRoutes = require('./routes/webhook');

// IMPORTANT: raw body for webhook
app.use('/api/webhook/paystack', express.raw({ type: 'application/json' }));

// Public
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/competitions', competitionRoutes);
app.use('/api/v1/payments', paymentRoutes);

// Admin (to manage these functionalities)
app.use('/api/admin/auth', adminManageAuthRoutes);
app.use('/api/admin/competitions', adminManageCompetitionRoutes);
app.use('/api/admin/payments', adminManagePaymentRoutes);
app.use('/api/admin/permissions', adminManagePermissionRoutes);

// Payment Webhook
app.use('/api/webhook', webhookRoutes);

// Test route
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      message: 'Server running',
      time: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`⚔️  ETI Code Games Server running on http://localhost:${PORT}`);
});