const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authenticate = require('../middlewares/auth'); // Import middleware


// Create a new comment
router.post('/',authenticate, commentController.createComment);

// Get all comments
router.get('/',authenticate, commentController.getAllComments);

// Get a specific comment by ID
router.get('/:id',authenticate, commentController.getCommentById);

// Update a comment by ID
router.put('/:id',authenticate, commentController.updateComment);

// Delete a comment by ID
router.delete('/:id',authenticate, commentController.deleteComment);

module.exports = router;
