const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true, unique: true }, // 42
    label: { type: String, required: true },                // "A-042"
    phone: { type: String, required: true },
    status: { type: String, enum: ['waiting', 'serving', 'served', 'skipped'], default: 'waiting' },
    active: { type: Boolean, default: true }, // true while waiting or serving
  },
  { timestamps: true }
);

// Rule: one ACTIVE token per phone. MongoDB enforces it, so even
// two simultaneous requests cannot create two active tokens.
tokenSchema.index({ phone: 1 }, { unique: true, partialFilterExpression: { active: true } });

module.exports = mongoose.model('Token', tokenSchema);
