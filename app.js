var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var dotenv = require('dotenv');
var connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
var app = express();

// Connect to MongoDB
connectDB();

// Import routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var profileRouter = require('./routes/profile');
var postRouter = require('./routes/post');
var commentRouter = require('./routes/comment');
var replyRouter = require('./routes/reply');

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the 'uploads' directory (for images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Correctly serve images via browser

// Enable CORS for cross-origin requests
app.use(cors());

// Route setup
app.use('/', indexRouter);
app.use('/api/users', usersRouter); // Updated to use /api/users for User CRUD API
app.use('/api/profiles', profileRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use('/api/replies', replyRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
