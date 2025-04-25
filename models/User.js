import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Define the User model with Sequelize
class User extends Model {
  // Method to add a new high score for a user
  async addScore(score) {
    const newScore = await UserScore.create({
      userId: this.id,
      score: score,
    });
    return newScore;
  }
  
  // Static method to get top scores across all users with pagination
  static async getTopScores(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const scores = await UserScore.findAll({
      include: [
        {
          model: User,
          attributes: ['name', 'picture'],
          required: true,
        }
      ],
      order: [['score', 'DESC']],
      offset,
      limit,
      raw: true,
      nest: true
    });
    
    return scores.map(score => ({
      name: score.User.name,
      picture: score.User.picture,
      score: score.score,
      date: score.createdAt
    }));
  }
  
  // Static method to count total number of scores
  static async countTotalScores() {
    return await UserScore.count();
  }
}

// Initialize the User model
User.init({
  googleId: {
    type: DataTypes.STRING,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  picture: {
    type: DataTypes.STRING
  }
}, {
  sequelize,
  modelName: 'User',
  timestamps: true
});

// Define a separate model for scores
class UserScore extends Model {}

UserScore.init({
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'UserScore',
  timestamps: true
});

// Define associations
User.hasMany(UserScore, { foreignKey: 'userId' });
UserScore.belongsTo(User, { foreignKey: 'userId' });

export default User;