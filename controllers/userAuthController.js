const User = require('../models/User');
const bcrypt = require('bcrypt');

// Render User Login Page
const getLogin = (req, res) => {
  res.render('public/login');
};

// Render User Register Page
const getRegister = (req, res) => {
  res.render('public/register');
};

// Handle User Registration
const postRegister = async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.send('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      role: 'user'  // 👈 important
    });

    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error registering user');
  }
};

// Handle Logout
const logout = (req, res) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/login');
  });
};

// Middleware to protect user-only routes
const ensureUser = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'user') {
    return next();
  }
  res.redirect('/login');
};

module.exports = {
  getLogin,
  getRegister,
  postRegister,
  logout,
  ensureUser
};
