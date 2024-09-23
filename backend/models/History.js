// models/History.js
const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  watchedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('History', HistorySchema);