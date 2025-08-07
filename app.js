// app.js

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const dotenv = require('dotenv');

dotenv.config();
require('./config/passport')(passport); // Passport config

const indexRouter = require('./routes/index');           // public-facing
const adminRouter = require('./routes/adminRoutes');     // admin login/dashboard
const userRoutes = require('./routes/userRoutes');
const adminCategoryRoutes = require('./routes/adminCategoryRoutes');
const adminCertificateRoutes = require('./routes/certificateRoutes');
const adminProductRoutes = require('./routes/adminProductRoutes');




const app = express();

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- View Engine ---
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// --- Sessions ---
app.use(session({
  secret: process.env.SESSION_SECRET || 'secretkey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

// --- Passport ---
app.use(passport.initialize());
app.use(passport.session());


app.use((req, res, next) => {
  res.locals.user = req.user || req.session.user || null;
  next();
});


// --- Routes ---
app.use('/', indexRouter);         // public routes (e.g. home, view product)
app.use('/', userRoutes);

app.use('/admin', adminRouter);    // admin routes (login, dashboard, CRUDs)
app.use('/admin', adminCategoryRoutes);
app.use('/admin', adminProductRoutes);
app.use('/admin', adminCertificateRoutes);



// --- 404 Handler ---
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});



module.exports = app;
