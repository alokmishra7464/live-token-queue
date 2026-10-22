const mongoose = require('mongoose');

// Holds the last used token number
const counterSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  seq: { type: Number, default: 0 },
});

module.exports = mongoose.model('Counter', counterSchema);
