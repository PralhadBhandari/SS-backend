const mongoose = require('mongoose');

// Define the Post Schema
const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postMedia: { type: String, required: true }, // Can be image or video URL
  caption: { type: String },
  address: { type: String, required: true }, // New field to store the user's address
  location: { 
    type: { 
      lat: { type: Number, required: true }, // Latitude
      lng: { type: Number, required: true }, // Longitude
    }, 
    required: true,
  },
  uploadedDate: { type: Date, default: Date.now },
  expiryDate: { 
    type: Date,
    default: function () {
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + 2); // 2 months from upload date
      return expiry;
    }
  },  
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('Post', postSchema);
