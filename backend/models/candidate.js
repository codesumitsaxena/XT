const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['image', 'pdf'],
    required: true
  },
  filePath: {
    type: String,
    required: true
  }
});

const candidateSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true },
  dob:       { type: String, required: true },

  residentialStreet1: { type: String, required: true },
  residentialStreet2: { type: String, required: true },

  sameAsResidential: { type: Boolean, default: true },

  permanentStreet1: { type: String },
  permanentStreet2: { type: String },

  documents: [documentSchema]

}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);