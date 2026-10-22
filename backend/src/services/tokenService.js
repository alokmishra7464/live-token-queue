const Counter = require('../models/Counter');
const Token = require('../models/Token');
const httpError = require('../utils/httpError');
const { notifyQueueChanged } = require('../socket');

// $inc is atomic in MongoDB, so two requests can never get the same number
async function nextNumber() {
  const counter = await Counter.findOneAndUpdate(
    { name: 'token' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

const makeLabel = (n) => `A-${String(n).padStart(3, '0')}`; // A-042

// ---------- customer ----------
exports.createToken = async (phone) => {
  const existing = await Token.findOne({ phone, active: true });
  if (existing) return existing; // already has a token

  const number = await nextNumber();
  try {
    const token = await Token.create({ number, label: makeLabel(number), phone });
    notifyQueueChanged();
    return token;
  } catch (err) {
    // Two taps at the same moment: the unique index rejects the second one
    if (err.code === 11000) {
      const mine = await Token.findOne({ phone, active: true });
      if (mine) return mine;
    }
    throw err;
  }
};

// Everything the customer screen needs in one response
exports.getStatus = async (phone) => {
  const token = await Token.findOne({ phone }).sort({ number: -1 }); // latest token
  const serving = await Token.findOne({ status: 'serving' });

  let ahead = 0;
  if (token && token.active) {
    ahead = await Token.countDocuments({ active: true, number: { $lt: token.number } });
  }

  return {
    token: token ? { label: token.label, status: token.status } : null,
    nowServing: serving ? serving.label : null,
    ahead,
  };
};

// ---------- admin ----------
exports.listQueue = () => Token.find({ active: true }).sort({ number: 1 });

exports.callNext = async () => {
  if (await Token.exists({ status: 'serving' })) {
    throw httpError(400, 'Mark the current customer as Done or Skip first');
  }
  const next = await Token.findOneAndUpdate(
    { status: 'waiting' },
    { status: 'serving' },
    { sort: { number: 1 }, new: true } // lowest number first
  );
  if (!next) throw httpError(404, 'No one is waiting');
  notifyQueueChanged();
  return next;
};

async function closeToken(id, newStatus, allowedFrom) {
  const token = await Token.findOneAndUpdate(
    { _id: id, status: { $in: allowedFrom } },
    { status: newStatus, active: false },
    { new: true }
  );
  if (!token) throw httpError(400, 'Token not found or already closed');
  notifyQueueChanged();
  return token;
}

exports.markDone = (id) => closeToken(id, 'served', ['serving']);
exports.markSkipped = (id) => closeToken(id, 'skipped', ['serving', 'waiting']);
