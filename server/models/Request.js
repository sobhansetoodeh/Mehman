const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  guestName: String,
  guestNationalId: String,
  guestPhone: String,
  coordinatorUnit: String,
  coordinatorName: String,
  coordinationLetterNo: String,
  stayFrom: Date,
  stayTo: Date,
  reason: String,
  villaNo: String,
  formFillerName: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'incomplete'], default: 'pending' },
  statusNote: String,
  trackingCode: { type: String, unique: true },
  createdBy: {
    userId: String,
    fullName: String,
    personnelCode: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  lastActionBy: {
  userId: String,
  fullName: String,
  role: String
},
});

module.exports = mongoose.model('Request', requestSchema);