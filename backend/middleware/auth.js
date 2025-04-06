const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No authentication token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError' 
      ? 'Authentication token expired' 
      : 'Invalid authentication token';
    res.status(401).json({ message });
  }
};

module.exports = { protect };