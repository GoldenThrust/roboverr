import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  picture: {
    type: String
  },
  highScores: [{
    score: {
      type: Number,
      default: 0
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Static method to get top scores across all users
userSchema.statics.getTopScores = async function(limit = 10) {
  return this.aggregate([
    { $unwind: "$highScores" },
    { $sort: { "highScores.score": -1 } },
    { $limit: limit },
    { $project: {
        name: 1,
        score: "$highScores.score",
        date: "$highScores.date",
        picture: 1
      }
    }
  ]);
};

// Method to add a new high score for a user
userSchema.methods.addScore = async function(score) {
  this.highScores.push({ score });
  return this.save();
};

const User = mongoose.model('User', userSchema);

export default User;