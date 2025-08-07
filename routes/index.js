const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const Product = require('../models/productModel'); 

router.get('/', homeController.renderHome);
router.get('/about', homeController.getAboutPage);
router.get('/services', homeController.getServicePage);
router.get('/news', homeController.getNewsPage);
router.get('/contact', homeController.getContactPage);
router.post('/contact', homeController.handleContactForm);

router.get('/api/search', homeController.searchProducts);

module.exports = router;