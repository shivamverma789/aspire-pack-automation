const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const ensureAdmin = require('../middlewares/ensureAdmin');
const upload = require('../middlewares/upload');


// 🟢 View all categories
router.get('/categories', ensureAdmin, categoryController.getAllCategories);

// 🟢 Render category create form
router.get('/categories/create', ensureAdmin, categoryController.getCreateForm);

// 🟢 Handle category creation with cover image
router.post('/categories/create', ensureAdmin, upload.single('coverImage'), categoryController.createCategory);

// 🟡 Render edit form
router.get('/categories/edit/:id', ensureAdmin, categoryController.getEditForm);

// 🟡 Handle category update (coverImage optional)
router.post('/categories/edit/:id', ensureAdmin, upload.single('coverImage'), categoryController.updateCategory);

// 🔴 Delete category
router.get('/categories/delete/:id', ensureAdmin, categoryController.deleteCategory);

router.post('/categories/delete/:id', ensureAdmin, categoryController.deleteCategory);

module.exports = router;
