const pool = require('../../../config/db');


// Get all users
async function getUsers(req, res) {
    try {
        const result = await pool.query(
            `SELECT id, username, email, full_name, phone, school_name, is_active, is_admin, created_at 
             FROM users
             ORDER BY created_at DESC;`
        );

        return res.status(200).json({
            users: result.rows
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}


// Get single user
async function getUserById(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT id, username, email, full_name, phone, school_name, is_active, is_admin, created_at 
             FROM users
             WHERE id = $1;`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({
            user: result.rows[0]
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}


// Update user
async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const {
            username,
            email,
            full_name,
            phone,
            school_name
        } = req.body;

        // Prevent empty updates
        if (
            !username &&
            !email &&
            !full_name &&
            !phone &&
            !school_name
        ) {
            return res.status(400).json({
                error: "Provide at least one field to update"
            });
        }

        const result = await pool.query(
            `UPDATE users
             SET
                username = COALESCE($1, username),
                email = COALESCE($2, email),
                full_name = COALESCE($3, full_name),
                phone = COALESCE($4, phone),
                school_name = COALESCE($5, school_name)
             WHERE id = $6
             RETURNING id, username, email, full_name, phone, school_name, is_active, is_admin, created_at;`,
            [
                username,
                email,
                full_name,
                phone,
                school_name,
                id
            ]
        );

        if (!result.rows.length) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({
            message: "User updated successfully",
            user: result.rows[0]
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}


// Delete user
async function deleteUser(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM users
             WHERE id = $1
             RETURNING id, email;`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({
            message: "User deleted successfully",
            user: result.rows[0]
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}


module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser
};