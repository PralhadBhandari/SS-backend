const mongoose = require('mongoose');

// Define the Reply Schema
const replySchema = new mongoose.Schema({
  comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', required: true }, // The comment this reply belongs to
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who made the reply
  text: { type: String, required: true }, // The reply text
  createdAt: { type: Date, default: Date.now }, // Timestamp of when the reply was created
  updatedAt: { type: Date, default: Date.now } // Timestamp of when the reply was last updated
});

// Middleware to update `updatedAt` field on document update
replySchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.model('Reply', replySchema);
