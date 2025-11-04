const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  photo: { type: String },
  userType: { type: String, enum: ['student', 'teacher', 'admin'], required: true },
  department: { type: String },
  // Additional fields for student flow & admin approval:
  studentNumber: { type: String, required: function() { return this.userType === 'student'; } },
  isApproved: { type: Boolean, default: false } // admin needs to approve
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);
