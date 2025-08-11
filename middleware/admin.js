const { protect } = require('./auth');

// Admin middleware - requires user to be authenticated and be the admin
const requireAdmin = async (req, res, next) => {
  // First ensure user is authenticated
  await protect(req, res, (err) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user is admin
    const adminEmail = process.env.ADMIN_EMAIL;
    
    if (!adminEmail) {
      return res.status(500).json({
        success: false,
        message: 'Admin email not configured'
      });
    }

    if (!req.user || req.user.email !== adminEmail) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    next();
  });
};

// Optional admin middleware - sets isAdmin flag but doesn't block
const optionalAdmin = async (req, res, next) => {
  try {
    await protect(req, res, (err) => {
      if (err || !req.user) {
        req.isAdmin = false;
      } else {
        const adminEmail = process.env.ADMIN_EMAIL;
        req.isAdmin = adminEmail && req.user.email === adminEmail;
      }
      next();
    });
  } catch (error) {
    req.isAdmin = false;
    next();
  }
};

module.exports = {
  requireAdmin,
  optionalAdmin
};

