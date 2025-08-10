const User = require('../models/User');
const bcrypt = require('bcrypt');

const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Certificate = require('../models/certificateModel');

// Render dashboard (only if logged in as admin)
const adminDashboard = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments({ parentCategory: null });
    const totalCertificates = await Certificate.countDocuments();
    const totalUsers =await User.countDocuments();

    res.render('admin/dashboard', {
      totalProducts,
      totalCategories,
      totalCertificates,
      totalUsers
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading dashboard');
  }
};
//admin reg

const getAdminRegister = (req, res) => {
  res.render('admin/register'); // EJS view: views/auth/adminRegister.ejs
};

// Handle first-time admin registration (optional)
const postRegister = async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.send('Admin with this username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new User({
      username,
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating admin");
  }
};

// Handle logout
const logout = (req, res) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
};

// Middleware to protect admin routes
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.redirect('/login');
};

module.exports = {
  getAdminRegister,
  adminDashboard,
  postRegister,
  logout,
  ensureAuthenticated
};
