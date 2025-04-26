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
// Redis session store
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';
// Import sequelize instance and models
import sequelize from './config/database.js';
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

// Get asset URL from environment variable or use default
const ASSET_URL = process.env.ASSET_URL || '/assets';

// Initialize database
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL database');

    // Sync models with database (create tables if they don't exist)
    await sequelize.sync();
    console.log('Database synchronized');
  } catch (err) {
    console.error('Failed to connect to the database:', err);
  }
})();

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

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// Connect to Redis and handle connection errors
let sessionStore;

const initializeRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis server for session storage');
    sessionStore = new RedisStore({
      client: redisClient,
      prefix: process.env.REDIS_PREFIX || 'roboverr_sess:'
    });
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
    sessionStore = new session.MemoryStore(); // Fall back to in-memory store if Redis fails
    console.log('Falling back to memory store for session storage');
  }
};

// Initialize Redis before setting up the app
initializeRedis().then(() => {
  // Initialize session middleware after Redis is connected (or fallback)
  const sessionConfig = {
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'none', 
      httpOnly: true,
      maxAge: 24*60*60*1000
    }
  };

  app.use(session(sessionConfig));

  app.use(express.static('public'));
  app.use('/assets', express.static('public'));
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  // Add middleware to make assetUrl available to all templates
  app.use((req, res, next) => {
    res.locals.assetUrl = ASSET_URL;
    next();
  });

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

    console.log('Google State:', state);

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
      topScores = await User.getTopScores(1, 3);
    } catch (error) {
      console.error('Error fetching top scores:', error);
    }

    res.render('index', {
      isAuthenticated: req.isAuthenticated,
      user: req.user,
      topScores: topScores,
      assetUrl: ASSET_URL // Make asset URL available to template
    });
  });

  app.get('/game', (req, res) => {
    res.render('game', {
      isAuthenticated: req.isAuthenticated,
      user: req.user,
      assetUrl: ASSET_URL // Make asset URL available to template
    });
  });

  app.get('/profile', (req, res) => {
    if (!req.isAuthenticated) {
      return res.redirect('/');
    }

    res.render('profile', {
      isAuthenticated: req.isAuthenticated,
      user: req.user,
      assetUrl: ASSET_URL // Make asset URL available to template
    });
  });

  // Google OAuth routes
  app.get('/auth/google/url', (req, res) => {
    req.session.state = state;
    console.log(state, req.session.state);
    return res.json({ url: getGoogleAuthURL() });
  });

  app.get('/auth/google/callback', async (req, res) => {
    const { code, state, error } = req.query;

    console.log('State mismatch:', state, req.session.state);
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
      let [user, created] = await User.findOrCreate({
        where: { email: data.email },
        defaults: {
          googleId: data.id,
          name: data.name,
          email: data.email,
          picture: data.picture
        }
      });

      // Update user data if it exists but some fields changed
      if (!created) {
        await user.update({
          googleId: data.id,
          name: data.name,
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
  app.get('/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.redirect('/');
  });

  app.get('/api/auth/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ success: true });
  });

  // Graceful shutdown handling
  const gracefulShutdown = async () => {
    console.log('Shutting down gracefully...');

    // Close Redis connection
    if (redisClient.isReady) {
      await redisClient.disconnect();
      console.log('Redis connection closed');
    }

    // Close database connection
    try {
      await sequelize.close();
      console.log('Database connection closed');
      process.exit(0);
    } catch (err) {
      console.error('Error closing database connection:', err);
      process.exit(1);
    }
  };

  // Listen for termination signals
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  server.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
    console.log(`Assets will be loaded from: ${ASSET_URL}`);
  });
})