const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  certificate: { type: String, required: true } // URL to the uploaded file
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
