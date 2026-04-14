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
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session()); // Enables session-based login

const pool = require('./config/db');

// Routes
const authRoutes = require('./api/v1/routes/authRoutes');
const competitionRoutes = require('./api/v1/routes/competitionRoutes');
const adminAuthRoutes = require('./api/admin/routes/authRoutes');
const adminCompetitionRoutes = require('./api/admin/routes/competitionRoutes');
const webhookRoutes = require('./routes/webhook');

// IMPORTANT: raw body for webhook
app.use('/api/webhook/paystack', express.raw({ type: 'application/json' }));

// Public
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/competitions', competitionRoutes);

// Admin
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/competitions', adminCompetitionRoutes);

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

// Simple Admin Route (add this before app.listen)
app.get('/api/admin/registrations', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, full_name, email, phone, university, category, 
                   registration_id, payment_status, created_at 
            FROM registrations 
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch registrations" });
    }
});

// Add this route
app.get('/api/verify-payment', async (req, res) => {
    const { reference } = req.query;
    if (!reference) return res.status(400).json({ status: "error", message: "No reference" });

    try {
        // Call Paystack Verify API
        const https = require('https');
        const options = {
            hostname: 'api.paystack.co',
            port: 443,
            path: `/transaction/verify/${reference}`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        };

        const reqPay = https.request(options, (apiRes) => {
            let data = '';
            apiRes.on('data', chunk => data += chunk);
            apiRes.on('end', async () => {
                try {
                    const response = JSON.parse(data);
                    if (response.status && response.data.status === 'success') {
                        const meta = response.data.metadata || {};
                        const customer = response.data.customer || {};

                        console.log("PAYSTACK DATA:", response.data);
                        console.log("METADATA:", meta);

                        // Save to database
                        const result = await pool.query(`
                            INSERT INTO registrations 
                            (full_name, email, phone, university, department, level, category, team_name, 
                             registration_id, payment_status, payment_reference, amount_paid)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'paid', $10, $11)
                            ON CONFLICT (email)
                            DO UPDATE SET
                            payment_status = 'paid',
                            payment_reference = EXCLUDED.payment_reference
                            RETURNING *
                        `, [
                            meta.full_name || customer.name,
                            customer.email,
                            meta.phone,
                            meta.university,
                            meta.department || 'Computer Science',
                            meta.level || '300L',
                            meta.category,
                            meta.team_name || null,
                            'ETI-' + Date.now().toString().slice(-8),
                            reference,
                            response.data.amount
                        ]);

                        if (result.rows.length > 0) {
                            res.json({
                                status: "success",
                                registration_id: result.rows[0].registration_id
                            });
                            console.log("DB RESULT:", result.rows);
                        } else {
                            res.json({
                                status: "error",
                                message: "Could not save registration"
                            });
                        }
                    } else {
                        res.json({ status: "failed" });
                    }
                } catch (e) {
                    res.status(500).json({ status: "error" });
                }
            });
        });

        reqPay.end();
    } catch (err) {
        res.status(500).json({ status: "error" });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`⚔️  ETI Code Games Server running on http://localhost:${PORT}`);
});