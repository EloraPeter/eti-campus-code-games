const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.post('/ambassador/apply', async (req, res) => {
  try {
    const { full_name, email, university, level, portfolio_url, why_represent } = req.body;

    if (!full_name || !email || !university) {
      return res.status(400).json({ status: false, message: "Missing required fields" });
    }

    const result = await pool.query(`
      INSERT INTO ambassadors (full_name, email, university, level, portfolio_url, why_represent)
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id, full_name, email, university, status
    `, [full_name, email, university, level, portfolio_url, why_represent]);

    res.status(201).json({ 
      status: true, 
      message: "Ambassador application submitted successfully",
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Failed to submit application" });
  }
});

module.exports = router;