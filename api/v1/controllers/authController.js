const pool = require('../../../config/db');
const bcrypt = require('bcrypt');
const paymentController = require('../../../controllers/paymentController');
const config = require('../../../config/index');

async function userRegistration(req, res) {
    /* 
        A user needs to pay to create a new account
        So, the user submits their details first, with their desired
        payment provider. We start the payment, send them the payment link
        when the payment is done, we actiate their account.

        The User's referral code is their username
    */

  try {
    const { competition_id, full_name, email, username, password, phone, school_name, provider, referral_code  } = req.body;

    // Validate
    if (!email || !password || !username || !competition_id || !full_name) {
      return res.status(400).json({ 
        error: 'Missing required fields: "email", "password", "username", "competition_id", "full_name"' 
      });
    }

    const paymentProvider = provider || 'paystack';

    // Basic password check
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if competition type is valid & return amount
    const competitionResult = await pool.query(
      `SELECT price FROM competitions WHERE id = $1`,
      [competition_id]
    );

    if (competitionResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid "competition_id"' 
      });
    };

    const competitionAmount = competitionResult.rows[0].price;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with that username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (inactive)
    const newUser = await pool.query(
      `INSERT INTO users (full_name, email, phone, school_name, password, username, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, false)
       RETURNING *`,
      [full_name, email, phone, school_name, hashedPassword, username]
    );

    const user = newUser.rows[0];

    // Initialize payment
    const payment = await paymentController.initializePayment({
      email,
      amount: competitionAmount * 100, // Paystack uses kobo
      provider
    });

    // Save payments in payments table
    await pool.query(
      `INSERT INTO payments (user_id, competition_id, amount, payment_reference, provider)
      VALUES ($1, $2, $3, $4, $5)`,
      [user.id, competition_id, competitionAmount, payment.reference, provider]
    );

    // We store the payment reference
    await pool.query(
      'UPDATE users SET payment_reference = $1 WHERE id = $2',
      [payment.reference, user.id]
    );

    // We store the referrer id in the user object
    // to anable us verify and pay the referre at webhook verification
    if (referral_code) {
      await pool.query(
        'UPDATE users SET referred_by = $1 WHERE id = $2',
        [referral_code, user.id]
      )
    }

    return res.status(201).json({
      message: 'User created. Complete payment to activate account.',
      payment_link: payment.payment_link
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


async function userLogin(req, res) {
    /*
        Here, we check if the user's account had been activated
        then give them feedback if not, or log them in if it had been activated
    */

  try {
    const { email, password } = req.body;

    // 1. Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // 3. Check if activated
    if (!user.is_active) {
      return res.status(403).json({
        error: `Account not activated. Please complete payment. 
        Or contact our Support Staff with your payment_reference if you have and the error persists.`,
        payment_reference: user.payment_reference
      });
    }

    // 4. MANUALLY ESTABLISH SESSION
    // req.login is added by Passport. It calls your serializeUser function.
    req.login(user, (err) => {
      if (err) return next(err);

      // 5. Success
      return res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        }
      });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


// View my profile
async function getMyProfile(req, res) {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT 
                id,
                username,
                email,
                full_name,
                school_name,
                phone,
                users_referred,
                is_active,
                created_at
             FROM users
             WHERE id = $1`,
            [userId]
        );

        return res.status(200).json({
            user: result.rows[0]
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Update my profile
async function updateMyProfile(req, res) {
    try {
        const userId = req.user.id;
        const { full_name, school_name, password } = req.body;

        if (!full_name && !school_name && !password) {
            return res.status(400).json({ error: "Nothing to update" });
        }

        let hashedPassword = null;

        // Handle password update
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ error: "Password must be at least 6 characters" });
            }

            hashedPassword = await bcrypt.hash(password, 10);
        }

        const result = await pool.query(
            `UPDATE users
             SET
                full_name = COALESCE($1, full_name),
                school_name = COALESCE($2, school_name),
                password = COALESCE($3, password)
             WHERE id = $4
             RETURNING 
                id, username, email, full_name, school_name, phone;`,
            [full_name, school_name, hashedPassword, userId]
        );

        return res.status(200).json({
            message: "Profile updated successfully",
            user: result.rows[0]
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = { 
  userRegistration, 
  userLogin,
  getMyProfile,
  updateMyProfile
   
};