const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authenticate = require('../middlewares/auth'); // Import middleware
// const upload = require('../middlewares/multerConfig'); // Import multer middleware
const upload = require('../config/cloudinary');

// CRUD routes for posts
router.post('/', authenticate, upload.single('postMedia'), postController.createPost); // Create a new post with media
router.put('/:id', authenticate, upload.single('postMedia'), postController.updatePost); // Update a post with new media

// router.get('/', authenticate, postController.getAllPosts); // Get all posts
router.get('/', postController.getAllPosts); // Get all posts

router.get('/:id', authenticate, postController.getPostById); // Get a post by ID
router.delete('/:id', authenticate, postController.deletePost); // Delete a post by ID

// Toggle like on a post
router.patch('/:postId/like', authenticate, postController.toggleLike);

module.exports = router;
