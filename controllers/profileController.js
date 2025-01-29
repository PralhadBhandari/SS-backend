const Profile = require('../models/profile');
const User = require('../models/user');
// Create a new profile with file upload
exports.createProfile = async (req, res) => {
  try {
    console.log("body : ", req.body);
    const { bio, username } = req.body;
    let userProfilePhoto = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : req.body.userProfilePhoto; // Generate file URL

    console.log("userProfilePhoto : ", userProfilePhoto)
    // Check if the user exists
    const user = await User.findById(req.body.user);
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }
    console.log("user", user)

    // Create the profile
    const profile = new Profile({
      user: req.body.user,
      userProfilePhoto,
      bio,
      username,
    });

    console.log("profile", profile)

    await profile.save();
    res.status(201).send({ message: 'Profile created successfully', profile });
  } catch (error) {
    res.status(400).send({ message: 'Error creating profile', error: error.message });
  }
};

// Update a profile with file upload
exports.updateProfile = async (req, res) => {
  try {
    console.log("BODY : ", req.body)
    let userProfilePhoto = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null; // Generate file URL
    
    console.log("userProfilePhoto : ", userProfilePhoto)
    const updatedProfileData = {
      ...req.body,
      ...(userProfilePhoto && { userProfilePhoto }), // Include photo only if uploaded
    };

    console.log("updatedProfileData : ", updatedProfileData)

    const profile = await Profile.findByIdAndUpdate(req.params.id, updatedProfileData, {
      new: true,
      runValidators: true,
    });

    console.log("profile : ", profile)

    if (!profile) {
      return res.status(404).send({ message: 'Profile not found' });
    }

    res.status(200).send({ message: 'Profile updated successfully', profile });
  } catch (error) {
    res.status(400).send({ message: 'Error updating profile', error: error.message });
  }
};

// Get all profiles
exports.getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', 'username email');
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profiles', error: error.message });
  }
};

// Get profile by user ID
exports.getProfileByUserId = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId }).populate('user', 'username email');
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};
