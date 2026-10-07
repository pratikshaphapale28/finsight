const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'finsight_dev_secret_key_jwt_2026_secured');
      
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found or authorization revoked.' });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('[Auth Middleware] Token verification failed:', error.message);
      return res.status(401).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. No authentication token provided.' });
  }
};

module.exports = { protect };
