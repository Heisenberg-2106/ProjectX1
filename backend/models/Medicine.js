const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  days: { type: Number, required: true },
  time: { type: String, required: true },
  frequency: { type: Number, required: true },
  mealTime: { type: String, enum: ['before', 'after', 'anytime'], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Medicine', medicineSchema);