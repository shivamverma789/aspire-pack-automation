const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const ensureAdmin = require('../middlewares/ensureAdmin');
const upload = require('../middlewares/upload');

// ============================
// Admin Product Routes
// ============================

// View all products
router.get('/products',ensureAdmin,  productController.getAllProducts);

const Category = require('../models/categoryModel');
// Render create product form
router.get('/products/new', ensureAdmin,async (req, res) => {
  const allCategories = await Category.find({});
  const mainCategories = allCategories.filter(cat => !cat.parentCategory);
  const subcategories = allCategories.filter(cat => cat.parentCategory);

  res.render('admin/products/create', { mainCategories, subcategories });
});

// Create product
router.post(
  '/products',
  ensureAdmin,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'productImages', maxCount: 10 }
  ]),
  productController.createProduct
);

// Render edit form
router.get('/products/edit/:id', ensureAdmin, async (req, res) => {
  const Product = require('../models/productModel');
  const Category = require('../models/categoryModel');
  const product = await Product.findById(req.params.id);
const mainCategories = await Category.find({ parentCategory: null });
const subCategories = await Category.find({ parentCategory: { $ne: null } });

  res.render('admin/products/edit', { product,mainCategories, subCategories });
});

// Update product
router.post(
  '/products/update/:id',
  ensureAdmin,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'productImages', maxCount: 10 }
  ]),
  productController.updateProduct
);

// Delete product
router.get('/products/delete/:id', ensureAdmin, productController.deleteProduct);

module.exports = router;
