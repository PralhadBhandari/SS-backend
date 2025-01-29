const express = require('express');
const router = express.Router();
const replyController = require('../controllers/replyController');
const authenticate = require('../middlewares/auth'); // Import middleware


// Create a new reply
router.post('/', authenticate, replyController.createReply);

// Get all replies
router.get('/',authenticate, replyController.getAllReplies);

// Get a single reply by ID
router.get('/:id',authenticate, replyController.getReplyById);

// Update a reply by ID
router.put('/:id',authenticate, replyController.updateReply);

// Delete a reply by ID
router.delete('/:id',authenticate, replyController.deleteReply);

module.exports = router;
