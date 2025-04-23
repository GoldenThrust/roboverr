import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import 'dotenv/config.js';
import crypto from 'crypto';
import mongoose from 'mongoose';
// Import routes and middleware
import scoresRoutes from './routes/scores.js';
import userRoutes from './routes/users.js';
import { isAuthenticated } from './middleware/auth.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/roboverr')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Set up OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 }
}));
app.use(express.static('public'));
app.use('/assets', express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Apply authentication middleware to all routes
app.use(isAuthenticated);

// Register route handlers
app.use(scoresRoutes);
app.use(userRoutes);

const state = crypto.randomBytes(32).toString('hex');

function getGoogleAuthURL() {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    include_granted_scopes: true,
    response_type: 'code',
    scope: scopes,
    state
  });
}

// Routes
app.get('/', async (req, res) => {
  let topScores = [];
  try {
    topScores = await User.getTopScores(1,3);
  } catch (error) {
    console.error('Error fetching top scores:', error);
  }
  
  res.render('index', { 
    isAuthenticated: req.isAuthenticated, 
    user: req.user,
    topScores: topScores
  });
});

app.get('/game', (req, res) => {
  res.render('game', { 
    isAuthenticated: req.isAuthenticated, 
    user: req.user 
  });
});

// Google OAuth routes
app.get('/auth/google/url', (req, res) => {
  req.session.state = state;
  return res.json({ url: getGoogleAuthURL() });
});

app.get('/auth/google/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.status(400).json({ error: 'Google authentication failed' });
  } else if (state !== req.session.state) {
    return res.status(400).json({ error: 'State mismatch. Possible CSRF attack' });
  }
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2'
    });

    const { data } = await oauth2.userinfo.get();
    
    if (!data.email || !data.name) {
      return res.status(400).json({ error: 'Google authentication failed' });
    }

    // Find or create user in database
    let user = await User.findOne({ email: data.email });
    
    if (!user) {
      user = await User.create({
        googleId: data.id,
        name: data.name,
        email: data.email,
        picture: data.picture
      });
    }

    const userPayload = {
      email: data.email,
      name: data.name,
      picture: data.picture,
      id: data.id
    };

    const token = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('auth_token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production'
    });
    
    res.redirect('/');
  } catch (error) {
    console.error('Error during Google authentication:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});


app.get('/api/auth/status', (req, res) => {
  res.json({ 
    authenticated: req.isAuthenticated, 
    user: req.user 
  });
});

// Logout
app.get('/api/auth/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ success: true });
});

server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});