const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  day: { type: String, required: true },
  meals: [{
    category: String,
    food: String,
    timestamp: String,
  }],
  water: [{
    amount: Number,
    timestamp: String,
  }],
  activities: [{
    type: String,
    duration: Number,
    timestamp: String,
  }],
  fasting: [{
    start: String,
    end: String,
    timestamp: String,
  }],
});

module.exports = mongoose.model('Data', dataSchema);