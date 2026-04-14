const pool = require('../../../config/db');


// Get all transactions (with user + competition info)
async function getAllTransactions(req, res) {
    try {
        const result = await pool.query(
            `SELECT 
                p.id,
                p.amount,
                p.status,
                p.payment_reference,
                p.provider,
                p.paid_at,
                p.created_at,

                u.id AS user_id,
                u.full_name,
                u.email,

                c.id AS competition_id,
                c.title AS competition_title

             FROM payments p
             LEFT JOIN users u ON p.user_id = u.id
             LEFT JOIN competitions c ON p.competition_id = c.id
             ORDER BY p.created_at DESC;`
        );

        return res.status(200).json({
            transactions: result.rows
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}


// Get recent transactions (last X days, default 7)
async function getRecentTransactions(req, res) {
    try {
        const days = parseInt(req.query.days) || 7;

        const result = await pool.query(
            `SELECT 
                p.id,
                p.amount,
                p.status,
                p.payment_reference,
                p.paid_at,
                p.created_at,

                u.full_name,
                u.email,

                c.title AS competition_title

             FROM payments p
             LEFT JOIN users u ON p.user_id = u.id
             LEFT JOIN competitions c ON p.competition_id = c.id
             WHERE p.created_at >= NOW() - INTERVAL '${days} days'
             ORDER BY p.created_at DESC;`
        );

        return res.status(200).json({
            recent_transactions: result.rows
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}


module.exports = {
    getAllTransactions,
    getRecentTransactions
};