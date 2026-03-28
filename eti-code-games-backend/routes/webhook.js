const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require('../config/db');

const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

router.post('/webhook', async (req, res) => {
  const hash = crypto.createHmac('sha512', SECRET_KEY)
                     .update(JSON.stringify(req.body))
                     .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(400).send('Invalid signature');
  }

  const event = req.body;

  if (event.event === 'charge.success') {
    const { reference, amount, metadata, customer } = event.data;

    try {
      await pool.query(`
        INSERT INTO registrations 
        (full_name, email, phone, university, department, level, category, team_name, 
         registration_id, payment_status, payment_reference, amount_paid)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'paid', $10, $11)
      `, [
        metadata.full_name,
        customer.email,
        metadata.phone,
        metadata.university,
        metadata.department,
        metadata.level,
        metadata.category,
        metadata.team_name || null,
        'ETI-' + Date.now().toString().slice(-8),
        reference,
        amount
      ]);

      console.log(`✅ Successful registration saved for ${metadata.full_name}`);
    } catch (err) {
      console.error('Error saving registration:', err);
    }
  }

  res.sendStatus(200);
});

module.exports = router;