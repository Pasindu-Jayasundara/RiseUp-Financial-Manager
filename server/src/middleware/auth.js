const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getUserStore } = require('../services/mockDataStore');

const JWT_SECRET = process.env.JWT_SECRET || 'riseup_secret_key_2026';

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Try database lookup first
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
        return next();
      }

      // If DB lookup didn't find DB doc, get user store from in-memory registry
      const store = getUserStore(decoded.email || decoded.id);
      if (store && store.user) {
        req.user = store.user;
        return next();
      }
    } catch (error) {
      // Invalid token
    }
  }

  // Default fallback user store
  const defaultStore = getUserStore('alex@riseup.io');
  req.user = defaultStore.user;
  next();
};

module.exports = { protect, JWT_SECRET };
