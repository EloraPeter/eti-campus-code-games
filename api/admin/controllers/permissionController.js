const pool = require('../../../config/db');


async function activateUser(req, res) {
    const { id } = req.params;

    const result = await pool.query(
        `UPDATE users SET is_active = true WHERE id = $1 RETURNING id, is_active`,
        [id]
    );

    if (!result.rows.length) {
        return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User activated", user: result.rows[0] });
}


async function deactivateUser(req, res) {
    const { id } = req.params;

    // Prevent admin deactivation
    const check = await pool.query(
        `SELECT is_admin FROM users WHERE id = $1`,
        [id]
    );

    if (!check.rows.length) {
        return res.status(404).json({ error: "User not found" });
    }

    if (check.rows[0].is_admin) {
        return res.status(403).json({ error: "Cannot deactivate an admin" });
    }

    const result = await pool.query(
        `UPDATE users SET is_active = false WHERE id = $1 RETURNING id, is_active`,
        [id]
    );

    res.json({ message: "User deactivated", user: result.rows[0] });
}


async function makeAdmin(req, res) {
    const { id } = req.params;

    const result = await pool.query(
        `UPDATE users SET is_admin = true WHERE id = $1 RETURNING id, is_admin`,
        [id]
    );

    if (!result.rows.length) {
        return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User promoted to admin", user: result.rows[0] });
}


async function removeAdmin(req, res) {
    const { id } = req.params;

    // Prevent self-demotion
    if (req.user.id === id) {
        return res.status(403).json({ error: "You cannot remove your own admin role" });
    }

    const result = await pool.query(
        `UPDATE users SET is_admin = false WHERE id = $1 RETURNING id, is_admin`,
        [id]
    );

    if (!result.rows.length) {
        return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Admin role removed", user: result.rows[0] });
}

module.exports = {
    activateUser,
    deactivateUser,
    makeAdmin, 
    removeAdmin
};