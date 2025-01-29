const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Replace with your environment variable or email
    pass: process.env.EMAIL_PASS, // Replace with your environment variable or app password
  },
  tls: {
    rejectUnauthorized: false, // Ignore self-signed certificate errors
  },
});


const sendEmail = async (to , subject , text , html ) => {
  const mailOptions = {
    from : 'sender-email@gmail.com',
    to, // recipient 
    subject,
    text,
    html,
  }

  try {
    transporter.sendMail(mailOptions);
    console.log("Email sent Successfully");
  } catch (error) {
    console.error('Error sending email : ', error);
    throw new Error('Email could not be sent');
  }
};

const JWT_SECRET = process.env.JWT_SECRET; // Replace with a secure key

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Check if email or username already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      username,
      password: hashedPassword,
      email,
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error registering user', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send token in response body
    res.status(200).json({
      message: 'Login successful',
      token: token, // Send token in response body
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get a single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Update a user by ID
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(400).json({ message: 'Error updating user', error: error.message });
  }
};

// Delete a user by ID
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

exports.forgotPassword = async ( req , res ) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if(!user){
      return res.status(404).json({message : 'User with email not exist'});
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl = `http://localhost:4200/reset-password/${resetToken}`;
    console.log(`Reset Password URL: ${resetUrl}`);

    // Send email with reset URL
    const subject = 'Password Reset Request';
    const text = `You have requested a password reset. Use the following link to reset your password: ${resetUrl}`;
    const html = `<p>You have requested a password reset. Click the link below to reset your password:</p><a href="${resetUrl}">Reset Password</a>`;
   
    await sendEmail(user.email, subject, text, html);

    res.status(200).json({ message : 'Password reset link has been sent to your email'});


  } catch (error) {
    res.status(500).json({ message : 'Error sending reset link', error : error.message})
    console.error('Error:', error.message);

  }
}

exports.resetPassword = async ( req, res ) => {
  try {
    const { token , password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken : hashedToken,
      resetPasswordExpires : { $gt : Date.now() },
    });

    if(!user){
      return res.status(400).json({message : "Invalid or expired token"});
    }

    const hashedPassword = await bcrypt.hash(password,10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    
    res.status(200).json({message : 'Password has been reset successfully'});
  } catch (error) {
    res.status(500).json({message:'Error resetting password', error : error.message});
    console.error('Error:', error.message);

  }
}