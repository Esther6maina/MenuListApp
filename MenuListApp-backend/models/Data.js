const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  day: { type: String, required: true }, // Format: YYYY-MM-DD
  meals: [
    {
      category: { type: String, required: true }, // e.g., Breakfast, Lunch
      description: { type: String, required: true },
      calories: { type: Number, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  water: [
    {
      amount: { type: Number, required: true }, // in ml
      timestamp: { type: Date, default: Date.now },
    },
  ],
  activities: [
    {
      description: { type: String, required: true },
      duration: { type: Number, required: true }, // in minutes
      timestamp: { type: Date, default: Date.now },
    },
  ],
  fasting: [
    {
      duration: { type: Number, required: true }, // in hours
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model('Data', dataSchema);