const crypto = require('crypto');
const pool = require('../config/db');

async function handlePaystackWebhook(req, res) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    // Verify Paystack signature
    const hash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).send('Invalid signature');
    }

    const event = req.body;

    // We only care about successful payments
    if (event.event === 'charge.success') {
      const data = event.data;

      const reference = data.reference;
      const paidAt = data.paid_at;

      // 1. Find payment
      const paymentResult = await pool.query(
        'SELECT * FROM payments WHERE payment_reference = $1',
        [reference]
      );

      if (paymentResult.rows.length === 0) {
        return res.status(404).send('Payment not found');
      }

      const payment = paymentResult.rows[0];

      // Prevent double processing
      if (payment.status === 'success') {
        return res.status(200).send('Already processed');
      }

      // 2. Update payment
      await pool.query(
        `UPDATE payments 
         SET status = 'success', paid_at = $1 
         WHERE id = $2`,
        [paidAt, payment.id]
      );

      // 3. Activate user
      await pool.query(
        `UPDATE users 
         SET is_active = true 
         WHERE id = $1`,
        [payment.user_id]
      );

      // Get referrer
      const referrer_result = await pool.query(
        `SELECT referred_by FROM users WHERE id=$1`,
        [payment.user_id]
      );

      const referrer_id = referrer_result.rows[0]?.referred_by;

      // If no referrer, stop early
      if (!referrer_id) {
        return;
      }

      // Increment referrer count
      await pool.query(
        `UPDATE users 
        SET users_referred = users_referred + 1 
        WHERE id = $1`,
        [referrer_id]
      );

      // 4. Generate receipt (ticket)
      const receiptNumber = `RCPT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      await pool.query(
        `INSERT INTO receipts (payment_id, receipt_number)
         VALUES ($1, $2)`,
        [payment.id, receiptNumber]
      );

      console.log('Payment processed:', reference);
    }

    return res.status(200).send('OK');
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).send('Server error');
  }
}

module.exports = {
  handlePaystackWebhook
};