const Certificate = require('../models/certificateModel');

// GET all certificates
exports.getAllCertificates = async (req, res) => {
  const certificates = await Certificate.find().sort({ createdAt: -1 });
  res.render('admin/certificates/list', { certificates });
};

// GET create form
exports.getCreateForm = (req, res) => {
  res.render('admin/certificates/create');
};

// POST create certificate
exports.createCertificate = async (req, res) => {
  try {
    const { name } = req.body;
    const certificate = req.file.path; // Uploaded file

    await Certificate.create({ name, certificate });
    res.redirect('/admin/certificates');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating certificate');
  }
};

// GET edit form
exports.getEditForm = async (req, res) => {
  const certificate = await Certificate.findById(req.params.id);
  res.render('admin/certificates/edit', { certificate });
};

// POST update
exports.updateCertificate = async (req, res) => {
  try {
    const { name } = req.body;
    const updateData = { name };

    if (req.file) {
      updateData.certificate = req.file.path;
    }

    await Certificate.findByIdAndUpdate(req.params.id, updateData);
    res.redirect('/admin/certificates');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating certificate');
  }
};

// DELETE
exports.deleteCertificate = async (req, res) => {
  await Certificate.findByIdAndDelete(req.params.id);
  res.redirect('/admin/certificates');
};

exports.getPublicCertificates = async (req, res) => {
  const certificates = await Certificate.find().sort({ createdAt: -1 });
  const user = req.user || null;
  res.render('certificates/all', { certificates, user });
};