const mongoose = require('mongoose')

const CandidateSchema = new mongoose.Schema({
  fullName: { type: String, trim: true, default: '' },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true, default: '' },
  passwordHash: { type: String, required: true },
  bankDetails: {
    iban: { type: String, trim: true, default: '' },
    bankName: { type: String, trim: true, default: '' },
    bic: { type: String, trim: true, default: '' },
  },
  documents: { type: [String], default: [] },
  status: {
    type: String,
    enum: ['Pending', 'HR_Review', 'In_Progress', 'Accepted', 'Rejected'],
    default: 'Pending',
  },
  hrApproval: {
    approved: { type: Boolean, default: false },
    comment: { type: String, default: '' },
  },
  itApproval: {
    accessCreated: { type: Boolean, default: false },
    corporateEmail: { type: String, default: '' },
  },
  financeApproval: {
    docsVerified: { type: Boolean, default: false },
  },
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Candidate', CandidateSchema)
