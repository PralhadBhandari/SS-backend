const Reply = require('../models/reply');

// Create a new reply
exports.createReply = async (req, res) => {
  try {
    const { text, user, comment } = req.body;
    const reply = new Reply({ text, user, comment });
    await reply.save();
    res.status(201).json({ message: 'Reply created successfully', reply });
  } catch (error) {
    res.status(400).json({ message: 'Error creating reply', error: error.message });
  }
};

// Get all replies
exports.getAllReplies = async (req, res) => {
  try {
    const replies = await Reply.find()
      .populate('user', 'name email')
      .populate('comment', 'text');
    res.status(200).json(replies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching replies', error: error.message });
  }
};

// Get a single reply by ID
exports.getReplyById = async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'comment',
        populate: { path: 'user', select: 'name email' }
      });
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    res.status(200).json(reply);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reply', error: error.message });
  }
};

// Update a reply by ID
exports.updateReply = async (req, res) => {
  try {
    const reply = await Reply.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    res.status(200).json({ message: 'Reply updated successfully', reply });
  } catch (error) {
    res.status(400).json({ message: 'Error updating reply', error: error.message });
  }
};

// Delete a reply by ID
exports.deleteReply = async (req, res) => {
  try {
    const reply = await Reply.findByIdAndDelete(req.params.id);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    res.status(200).json({ message: 'Reply deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting reply', error: error.message });
  }
};
