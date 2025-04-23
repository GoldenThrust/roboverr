import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to check if user is authenticated
export const isAuthenticated = async (req, res, next) => {
  const token = req.cookies.auth_token;
  
  if (!token) {
    req.isAuthenticated = false;
    req.user = null;
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user = await User.findOne({ email: decoded.email });
    
    if (!user) {
      user = await User.create({
        googleId: decoded.id,
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture
      });
    }
    
    req.isAuthenticated = true;
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture
    };
    
    next();
  } catch (error) {
    req.isAuthenticated = false;
    req.user = null;
    next();
  }
};

// Middleware to require authentication, redirecting to home if not authenticated
export const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated) {
    return res.redirect('/');
  }
  next();
};