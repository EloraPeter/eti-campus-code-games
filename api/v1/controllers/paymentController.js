const pool = require('../../../config/db');

async function getMyPayments(req, res) {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT 
                p.id,
                p.amount,
                p.status,
                p.payment_reference,
                p.paid_at,
                p.created_at,
                c.title AS competition_title

             FROM payments p
             LEFT JOIN competitions c ON p.competition_id = c.id
             WHERE p.user_id = $1
             ORDER BY p.created_at DESC;`,
            [userId]
        );

        return res.status(200).json({
            payments: result.rows
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = { getMyPayments };