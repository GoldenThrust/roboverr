import express from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get top scores
router.get('/api/scores/top', async (req, res) => {
  try {
    const topScores = await User.getTopScores(10);
    res.json(topScores);
  } catch (error) {
    console.error('Error fetching top scores:', error);
    res.status(500).json({ error: 'Failed to fetch top scores' });
  }
});

// Get user's scores
router.get('/api/scores/user', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const scores = user.highScores.sort((a, b) => b.score - a.score);
    res.json(scores);
  } catch (error) {
    console.error('Error fetching user scores:', error);
    res.status(500).json({ error: 'Failed to fetch user scores' });
  }
});

// Save new score
router.post('/api/scores', requireAuth, async (req, res) => {
  try {
    const { score } = req.body;
    
    if (!score || isNaN(score)) {
      return res.status(400).json({ error: 'Valid score is required' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await user.addScore(Number(score));
    res.json({ success: true, message: 'Score saved successfully' });
  } catch (error) {
    console.error('Error saving score:', error);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

export default router;