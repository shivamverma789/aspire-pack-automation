const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const ensureAdmin = require('../middlewares/ensureAdmin');
const upload = require('../middlewares/upload');

// Admin certificate routes
router.get('/certificates', ensureAdmin, certificateController.getAllCertificates);
router.get('/certificates/new', ensureAdmin, certificateController.getCreateForm);
router.post('/certificates/new', ensureAdmin, upload.single('certificate'), certificateController.createCertificate);
router.get('/certificates/edit/:id', ensureAdmin, certificateController.getEditForm);
router.post('/certificates/edit/:id', ensureAdmin, upload.single('certificate'), certificateController.updateCertificate);
router.get('/certificates/delete/:id', ensureAdmin, certificateController.deleteCertificate);

module.exports = router;
