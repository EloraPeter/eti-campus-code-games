const pool = require('../../../config/db');

async function listCompetitions(req, res) {
    try {
        // Everyone can read competitions
        const result = await pool.query("SELECT * FROM competitions ORDER BY created_at DESC;");
        return res.status(200).json({
            competitions: result.rows
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

async function createCompetition(req, res) {
    try {
        const { title, description, price } = req.body;

        if (!title) {
            return res.status(400).json({ error: "Competition Title is required." });
        }

        const result = await pool.query(
            "INSERT INTO competitions (title, description, price) VALUES ($1, $2, $3) RETURNING *;",
            [title, description, price || 2500]
        );

        return res.status(201).json({
            message: "Competition created successfully",
            competition: result.rows[0]
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

async function updateCompetition(req, res) {
    try {
        const { id } = req.params;
        const { title, description, price } = req.body;

        // Validate ID
        if (!id) {
            return res.status(400).json({ error: "Competition ID is required" });
        }

        // Optional: ensure at least one field is provided
        if (!title && !description && !price) {
            return res.status(400).json({ error: "Provide at least one field to update" });
        }

        // Price Validation: Must be non-negative
        if (price && price < 0) {
            return res.status(400).json({ error: "Price cannot be negative" });
        }

        const result = await pool.query(
            `UPDATE competitions
             SET 
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                price = COALESCE($3, price)
             WHERE id = $4
             RETURNING *;`,
            [title, description, price, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Competition not found" });
        }

        return res.status(200).json({
            message: "Competition updated successfully",
            competition: result.rows[0]
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

async function deleteCompetition(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM competitions
             WHERE id = $1
             RETURNING *;`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Competition not found" });
        }

        return res.status(200).json({
            message: "Competition deleted successfully",
            competition: result.rows[0]
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    listCompetitions,
    createCompetition,
    updateCompetition,
    deleteCompetition
};
