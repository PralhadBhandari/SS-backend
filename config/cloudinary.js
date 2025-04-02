const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'StreetsnapTest',
    format: async (req, file) => file.mimetype.split('/')[1], // Dynamically detect file type
    public_id: (req, file) => `${Date.now()}-${file.originalname.split('.')[0]}`, // Fixed file reference
  }
});

// Initialize Multer with Cloudinary Storage
const upload = multer({ storage });

module.exports = { upload, cloudinary };



// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const multer = require('multer');
// require('dotenv').config(); // Ensure environment variables are loaded

// Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Set up Cloudinary Storage
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'streetsnap',
//     allowed_formats: ['jpeg', 'jpg', 'png', 'webp'],
//     transformation: [{ width: 500, height: 500, crop: 'limit' }],
//   },
// });

// Initialize Multer with Cloudinary Storage
// const upload = multer({ storage });

// module.exports = upload;
