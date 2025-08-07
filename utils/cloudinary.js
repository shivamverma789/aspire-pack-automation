const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'aspire-categories',
    resource_type: 'image',
    format: async (req, file) => 'jpg', // or use file.originalname.split('.').pop()
  }
});

module.exports = { cloudinary, storage };
