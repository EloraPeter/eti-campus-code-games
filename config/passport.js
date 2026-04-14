// A middleware for authentication

const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt'); // Use bcrypt to check hashed passwords
const pool = require('./db');     // Your database connection

module.exports = function(passport) {
    passport.use(new LocalStrategy(
        { usernameField: 'email' },
        async (email, password, done) => {
            try {
                // Find user and match password
                const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
                if (result.rows.length === 0) return done(null, false, { message: 'Invalid credentials' });
                
                const user = result.rows[0];
                const isMatch = await bcrypt.compare(password, user.password);
                
                if (isMatch) return done(null, user); // Success! populates req.user
                return done(null, false, { message: 'Invalid credentials' });
            } catch (err) { return done(err); }
        }
    ));

    // Serialize ID to session
    passport.serializeUser((user, done) => done(null, user.id));

    // Deserialize: Query DB for user object using ID from session
    passport.deserializeUser(async (id, done) => {
        try {
            const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
            done(null, result.rows[0]); // req.user = result.rows[0]
        } catch (err) { done(err, null); }
    });
};
