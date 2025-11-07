const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    subject_name: { type: String, required: true },
    units: { type: Number, required: true },
    department: { type: String, required: true },
    year_level: { type: Number, required: true },
    semester: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
