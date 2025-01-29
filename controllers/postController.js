const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');
const Reply = require('../models/reply');

// Toggle like on a post
exports.toggleLike = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id; // Assuming user ID is available in req.user after authentication

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user has already liked the post
    const likeIndex = post.likes.findIndex((id) => id.toString() === userId);

    if (likeIndex === -1) {
      // If user hasn't liked the post, add their ID
      post.likes.push(userId);
    } else {
      // If user already liked the post, remove their ID
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.status(200).json({ message: 'Like toggled successfully', likesCount: post.likes.length });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getAllPosts = async (req, res) => {
  try {
    // First, find all posts
    const posts = await Post.find()
      // Populate basic user info for the post
      .populate('user', 'username email')
      // Populate likes
      .populate('likes', 'username email')
      // Populate comments with nested population
      .populate({
        path: 'comments',
        populate: [
          // Populate user info for each comment
          {
            path: 'user',
            select: 'username email'
          },
          // Populate replies for each comment
          {
            path: 'replies',
            model: 'Reply',
            populate: {
              path: 'user',
              model: 'User',
              select: 'username email'
            }
          }
        ]
      })
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: 'No posts found' });
    }

    // Process and clean up the data
    const enrichedPosts = await Promise.all(posts.map(async (post) => {
      // Ensure comments array exists and is populated
      const processedComments = await Promise.all((post.comments || []).map(async (comment) => {
        // Fetch replies directly if they're not properly populated
        let populatedReplies = comment.replies;
        if (!populatedReplies || populatedReplies.length === 0) {
          populatedReplies = await Reply.find({ comment: comment._id })
            .populate('user', 'username email')
            .lean();
        }

        return {
          ...comment,
          replies: populatedReplies.map(reply => ({
            ...reply,
            user: reply.user || null
          })),
          user: comment.user || null
        };
      }));

      return {
        ...post,
        postMedia: post.postMedia || 'https://via.placeholder.com/150',
        comments: processedComments,
        likes: post.likes || []
      };
    }));

    res.status(200).json(enrichedPosts);
  } catch (error) {
    console.error('Error in getAllPosts:', error);
    res.status(500).json({
      message: 'Error fetching posts',
      error: error.message
    });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate('user', 'username email')
      .populate('likes', 'username email')
      .populate({
        path: 'comments',
        populate: [
          {
            path: 'user',
            select: 'username email'
          },
          {
            path: 'replies',
            model: 'Reply',
            populate: {
              path: 'user',
              model: 'User',
              select: 'username email'
            }
          }
        ]
      })
      .sort({ createdAt: -1 })
      .lean();

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: 'No posts found for this user' });
    }

    // Process and clean up the data
    const enrichedPosts = await Promise.all(posts.map(async (post) => {
      const processedComments = await Promise.all((post.comments || []).map(async (comment) => {
        let populatedReplies = comment.replies;
        if (!populatedReplies || populatedReplies.length === 0) {
          populatedReplies = await Reply.find({ comment: comment._id })
            .populate('user', 'username email')
            .lean();
        }

        return {
          ...comment,
          replies: populatedReplies.map(reply => ({
            ...reply,
            user: reply.user || null
          })),
          user: comment.user || null
        };
      }));

      return {
        ...post,
        postMedia: post.postMedia || 'https://via.placeholder.com/150',
        comments: processedComments,
        likes: post.likes || []
      };
    }));

    res.status(200).json(enrichedPosts);
  } catch (error) {
    console.error('Error in getPostById:', error);
    res.status(500).json({
      message: 'Error fetching posts',
      error: error.message
    });
  }
};




// Keep other controller methods
exports.createPost = async (req, res) => {
  try {
    console.log("req : ", req.body)
    const { caption, address, location } = req.body;
    let postMedia = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : req.body.postMedia; // Generate file URL
 
    console.log("postMedia : ", postMedia)
    // Check if the user exists
    const user = await User.findById(req.body.user);
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }
    console.log("user : ", user)

    // Create the post
    const post = new Post({
      user: req.body.user,
      postMedia,
      caption,
      address,
      location: typeof location === "string" ? JSON.parse(location) : location, // Assuming location is sent as a JSON string
    });

    console.log("post : ", post)

    await post.save();
    res.status(201).send({ message: 'Post created successfully', post });
  } catch (error) {
    res.status(400).send({ message: 'Error creating post', error: error.message });
  }
};





// Update a post with media upload
exports.updatePost = async (req, res) => {
  try {
    let postMedia = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null; // Generate file URL

    const updatedPostData = {
      ...req.body,
      ...(postMedia && { postMedia }), // Include media only if uploaded
    };

    const post = await Post.findByIdAndUpdate(req.params.id, updatedPostData, {
      new: true,
      runValidators: true,
    });

    if (!post) {
      return res.status(404).send({ message: 'Post not found' });
    }

    res.status(200).send({ message: 'Post updated successfully', post });
  } catch (error) {
    res.status(400).send({ message: 'Error updating post', error: error.message });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
};
