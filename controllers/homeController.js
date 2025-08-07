const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

exports.renderHome = async (req, res) => {
  try {
    const categories = await Category.find().limit(6);
    const topProducts = await Product.find().sort({ _id: -1 }).limit(6); // or use likes/featured field
    const user = req.user || null;

    res.render('index', { categories, topProducts, user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading homepage');
  }
};

exports.getAboutPage = (req, res) => {
  res.render('about');
};
exports.getServicePage = (req, res) => {
  res.render('services');
};

exports.getNewsPage = (req, res) => {
  res.render('news');
};

exports.getContactPage = (req, res) => {
  res.render('contact');
};

exports.handleContactForm = (req, res) => {
  const { name, email, message } = req.body;

  // For now, just log it — or send email/save in DB
  console.log("New Contact Message:", { name, email, message });

  res.send("Thanks for contacting us! We'll get back to you soon.");
};


exports.searchProducts = async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json([]);

  try {
    const products = await Product.find({
      productName: { $regex: q, $options: 'i' }
    }).select('productName slug coverImage').limit(6);

    res.json(products);
  } catch (err) {
    res.status(500).json([]);
  }
};