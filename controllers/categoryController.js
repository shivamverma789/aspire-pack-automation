const Category = require('../models/categoryModel');
const slugify = require('slugify'); // ✅ Import slugify

// GET all categories (Admin)
const getAllCategories = async (req, res) => {
  try {
    // Fetch all categories and populate subcategories
    const categories = await Category.find({})
      .populate('subcategories') // Get subcategory data
      .populate('parentCategory') // Get parent info for subcategories
      .lean(); // Convert to plain JS objects

      

    res.render('admin/categories/list', { categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).send('Error loading categories');
  }
};


// GET Create Form (Admin)
const getCreateForm = async (req, res) => {
  const mainCategories = await Category.find({ parentCategory: null });
  res.render('admin/categories/create', { mainCategories });
};

// POST Category with image (Admin)
const createCategory =async (req, res) => {
  try {
    const { name, isMainCategory, parentCategory } = req.body;
    const coverImage = req.file?.path || ''; // multer handles image

    const slug = slugify(name, { lower: true });

    const newCategory = new Category({
      name,
      slug,
      coverImage,
      isMainCategory: isMainCategory === 'true',
      parentCategory: isMainCategory === 'true' ? null : parentCategory
    });

    const saved = await newCategory.save();

    // If it's a subcategory, push it into parent.subcategories[]
    if (!saved.isMainCategory && saved.parentCategory) {
      await Category.findByIdAndUpdate(saved.parentCategory, {
        $push: { subcategories: saved._id }
      });
    }

    res.redirect('/admin/categories');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating category');
  }
};

// GET Edit Form (Admin)
const getEditForm = async (req, res) => {
  const category = await Category.findById(req.params.id);
  // const mainCategories = await Category.find({ isMainCategory: true, _id: { $ne: category._id } });
  const mainCategories = await Category.find({ parentCategory: null });
  res.render('admin/categories/edit', { category, mainCategories });
};


// POST Update Category (Admin)
const updateCategory = async (req, res) => {
  try {
    const { name, isMainCategory, parentCategory } = req.body;
    const slug = slugify(name, { lower: true });

    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).send('Category not found');

    const isNowMain = isMainCategory === 'true';
    const newParent = isNowMain ? null : parentCategory;

    // Handle removal from old parent if it was a subcategory
    if (!category.isMainCategory && category.parentCategory?.toString() !== newParent) {
      await Category.findByIdAndUpdate(category.parentCategory, {
        $pull: { subcategories: category._id }
      });
    }

    // Handle adding to new parent
    if (!isNowMain && newParent) {
      await Category.findByIdAndUpdate(newParent, {
        $addToSet: { subcategories: category._id }
      });
    }

    // Build update object
    const update = {
      name,
      slug,
      isMainCategory: isNowMain,
      parentCategory: newParent
    };

    if (req.file) {
      update.coverImage = req.file.path;
    }

    await Category.findByIdAndUpdate(req.params.id, update);
    res.redirect('/admin/categories');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating category');
  }
};


// POST DELETE Category (Admin)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) return res.status(404).send('Category not found');

    // Prevent deleting a main category if it still has subcategories
    if (category.isMainCategory && category.subcategories.length > 0) {
      return res.status(400).send('Cannot delete category with subcategories. Please delete them first.');
    }

    // If it's a subcategory, remove it from its parent's subcategories array
    if (!category.isMainCategory && category.parentCategory) {
      await Category.findByIdAndUpdate(category.parentCategory, {
        $pull: { subcategories: category._id }
      });
    }

    // Delete the category
    await Category.findByIdAndDelete(req.params.id);
    res.redirect('/admin/categories');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting category');
  }
};


// GET All Categories (Public)
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    const user = req.user || null;
    res.render('categories/allCategories', { categories, user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching categories');
  }
};

module.exports = {
  getCategories,
  getAllCategories,
  getCreateForm,
  createCategory,
  getEditForm,
  updateCategory,
  deleteCategory
};
