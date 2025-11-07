const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    accounts_ref: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    student_number: {
      type: String,
      required: true,
      unique: true,
    },
    year_level: { type: Number, required: true },
    department: { type: String, required: true },
    course: { type: String, required: true },
    birthday: Date,
    address: String,
    phone: String,
    mother: String,
    father: String,
    guardian_phone: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
