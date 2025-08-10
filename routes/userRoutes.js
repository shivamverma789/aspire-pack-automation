const express = require('express');
const router = express.Router();
const passport = require('passport');
const userAuthController = require('../controllers/userAuthController');
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const { ensureAuthenticated } = require('../middlewares/ensureAuth');
const certificateController = require('../controllers/certificateController');


// Common login page
router.get('/login', userAuthController.getLogin);

// Unified login POST
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect('/login');

    req.logIn(user, (err) => {
      if (err) return next(err);

      // 🎯 Role-based redirect
      if (user.role === 'admin') return res.redirect('/admin/dashboard'); 
      if (user.role === 'user') return res.redirect('/');
    });
  })(req, res, next);
});

router.get('/register', userAuthController.getRegister);
router.post('/register', userAuthController.postRegister);
router.get('/logout', userAuthController.logout);


// View all products (public)
router.get(['/products', '/category/:slug'], productController.getPublicProducts);


// View product by category
// router.get('/category/:slug', productController.getProductsByCategory);

// View single product detail
router.get('/product/:slug', productController.getProductDetails);

// Like a product (only if user is logged in)
router.post('/product/:id/like', ensureAuthenticated, productController.likeProduct);

// View all categories (public route)
router.get('/categories', categoryController.getCategories);


//get all certificates
router.get('/certificates', certificateController.getPublicCertificates);

module.exports = router;
