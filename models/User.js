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

// Static method to get top scores across all users with pagination
userSchema.statics.getTopScores = async function(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.aggregate([
    { $unwind: "$highScores" },
    { $sort: { "highScores.score": -1 } },
    { $skip: skip },
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

// Static method to count total number of scores
userSchema.statics.countTotalScores = async function() {
  const result = await this.aggregate([
    { $unwind: "$highScores" },
    { $count: "totalScores" }
  ]);
  
  return result.length > 0 ? result[0].totalScores : 0;
};

// Method to add a new high score for a user
userSchema.methods.addScore = async function(score) {
  this.highScores.push({ score });
  return this.save();
};

const User = mongoose.model('User', userSchema);

export default User;