const mongoose = require('mongoose');

// Define the Comment Schema
const commentSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true }, // Post ID the comment belongs to
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who made the comment
  text: { type: String, required: true }, // The comment text
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reply' }], // Replies to the comment
  createdAt: { type: Date, default: Date.now }, // Timestamp of when the comment was created
  updatedAt: { type: Date, default: Date.now } // Timestamp of when the comment was last updated
});

// Middleware to update `updatedAt` field on document update
commentSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.model('Comment', commentSchema);
