// middleware/auth.js
const jwt = require('jsonwebtoken');
const Account = require('../models/Account');

const authMiddleware = async (req, res, next) => {
  try {
    // Token from cookie or Authorization header
    let token = null;
    if (req.cookies && req.cookies.token) token = req.cookies.token;
    if (!token && req.header('Authorization')) {
      const auth = req.header('Authorization');
      if (auth.startsWith('Bearer ')) token = auth.split(' ')[1];
    }

    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // attach user minimal info to req
    const user = await Account.findById(payload.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });

    // If account must be approved to access, check:
    if (!user.isApproved && user.userType !== 'admin') {
      // admins can always access admin panel; other types need approval
      return res.status(403).json({ message: 'Account pending admin approval' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

// roles: array of allowed roles e.g. ['admin']
const authorizeRoles = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    if (!roles.includes(req.user.userType)) return res.status(403).json({ message: 'Forbidden: insufficient role' });
    next();
  };
};

module.exports = { authMiddleware, authorizeRoles };
