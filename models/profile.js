const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Link to the User model
    required: true
  },
  userProfilePhoto: {
    type: String, // URL or path to the profile photo
    default: 'default-profile.jpg'
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
    default: ''
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Profile', profileSchema);
