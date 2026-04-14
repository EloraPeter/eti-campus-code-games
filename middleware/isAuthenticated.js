// Helper middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next(); // req.isAuthenticated() is a Passport method
    res.status(401).json({ error: "Please log in first" });
};

module.exports = isAuthenticated;