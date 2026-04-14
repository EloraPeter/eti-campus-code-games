function isAdmin(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Please log in first" });
    }

    if (!req.user.is_admin) {
        return res.status(403).json({ error: "Admins only" });
    }

    next();
}

module.exports = isAdmin;