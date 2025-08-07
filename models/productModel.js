const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  categoryId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Category',
  required: true
},
subCategoryId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Category',
  default: null
},
  productImages: {
    type: [String],
    default: []
  },
  coverImage: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    default: "Premium industrial packaging equipment."
  },
  productDescription: {
    type: String,
    required: true
  },
  productFeatures: {
    type: [String],
    default: []
  },
  productApplications: {
    type: [String],
    default: []
  },
  productParameters: {
    type: [{
      key: { type: String },
      value: { type: String }
    }],
    default: []
  },
  productModelNumber: {
    type: String,
    required: true
  },
  videoURL: {
    type: String,
    default: ""
  },
  specPDF: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
