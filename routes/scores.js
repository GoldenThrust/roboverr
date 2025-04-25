import express from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
// import { Op } from 'sequelize';
import sequelize from '../config/database.js';

const router = express.Router();

router.get('/api/scores/top', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const scores = await User.getTopScores(page, limit);
    const totalScores = await User.countTotalScores();
    
    res.json({
      scores,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalScores / limit),
        limit,
        totalScores
      }
    });
  } catch (error) {
    console.error('Error fetching top scores:', error);
    res.status(500).json({ error: 'Failed to fetch top scores' });
  }
});

// Get user's scores
router.get('/api/scores/user', requireAuth, async (req, res) => {
  try {
    const { UserScore } = sequelize.models;
    if (!UserScore) {
      return res.status(500).json({ error: 'UserScore model not found' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const scores = await UserScore.findAll({
      where: { userId: user.id },
      order: [['score', 'DESC']],
      raw: true
    });

    // Format the response to match the expected structure
    const formattedScores = scores.map(score => ({
      score: score.score,
      date: score.createdAt
    }));
    
    res.json(formattedScores);
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
    
    const user = await User.findByPk(req.user.id);
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