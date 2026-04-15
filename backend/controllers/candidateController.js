const Candidate = require('../models/candidate');

const submitCandidate = async (req, res) => {
  try {
    // ✅ Fields are sent individually, not wrapped in "data"
    const {
      firstName, lastName, email, dob,
      residentialStreet1, residentialStreet2,
      sameAsResidential, permanentStreet1, permanentStreet2,
      documentsMeta  // ✅ correct key name
    } = req.body;

    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ success: false, message: 'Minimum 2 documents required' });
    }

    const parsedSameAs = sameAsResidential === 'true' || sameAsResidential === true;

    if (!parsedSameAs && (!permanentStreet1 || !permanentStreet2)) {
      return res.status(400).json({ success: false, message: 'Permanent address is required' });
    }

    // ✅ parse documentsMeta string into array
    const docsMeta = JSON.parse(documentsMeta);

    const documents = docsMeta.map((doc, index) => ({
      fileName: doc.fileName,
      fileType: doc.fileType,
      filePath: req.files[index] ? req.files[index].path : ''
    }));

    const candidate = new Candidate({
      firstName, lastName, email, dob,
      residentialStreet1, residentialStreet2,
      sameAsResidential: parsedSameAs,
      permanentStreet1: permanentStreet1 || '',
      permanentStreet2: permanentStreet2 || '',
      documents
    });

    await candidate.save();
    res.status(201).json({ success: true, message: 'Form submitted successfully', data: candidate });

  } catch (error) {
    console.error('Submit Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.json({ success: true, data: candidates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { submitCandidate, getAllCandidates };