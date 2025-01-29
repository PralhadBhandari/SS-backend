const Comment = require('../models/comment');
const Post = require('../models/post')

// Create a new comment
// Create a new comment
exports.createComment = async (req, res) => {
  console.log("Received body:", req.body); // Debugging

  const { post, user, text } = req.body; // Match the schema fields

  try {
    // Create a new comment
    const newComment = await Comment.create({
      post, // Match schema's `post`
      user, // Match schema's `user`
      text, // Text of the comment
    });

    // Add the comment ID to the Post's comments array
    await Post.findByIdAndUpdate(
      post,
      { $push: { comments: newComment._id } },
      { new: true }
    );

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error creating comment:", error); // Log error details
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
};


// Get all comments
exports.getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find().populate('post user');
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
};

// Get a specific comment by ID
exports.getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id).populate('post user');
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comment', error: error.message });
  }
};

// Update a comment by ID
exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.status(200).json({ message: 'Comment updated successfully', comment });
  } catch (error) {
    res.status(400).json({ message: 'Error updating comment', error: error.message });
  }
};

// Delete a comment by ID
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
};
