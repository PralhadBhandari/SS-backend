const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const upload = require('../middlewares/multerConfig'); // Use the updated multer configuration
const authenticate = require('../middlewares/auth'); // Import middleware


// Define routes and their respective handlers
router.get('/',authenticate, profileController.getAllProfiles); // Get all profiles
router.get('/:userId',authenticate, profileController.getProfileByUserId); // Get profile by user ID
router.post('/',authenticate, upload.single('userProfilePhoto'), profileController.createProfile); // Create a profile with file upload
router.put('/:id',authenticate, upload.single('userProfilePhoto'), profileController.updateProfile); // Update a profile with file upload

module.exports = router;
