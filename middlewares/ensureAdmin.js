module.exports = function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next(); // ✅ Allow access
  }

  // ❌ Not authenticated or not admin
  return res.redirect('/login');
};
