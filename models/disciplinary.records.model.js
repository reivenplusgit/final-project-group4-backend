const mongoose = require("mongoose");

const disciplinaryRecordSchema = new mongoose.Schema(
  {
    teachers_id: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    student_number: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    remarks: String,
    severity: { type: Number, required: true },
    date: { type: String, required: true },
    violation: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "DisciplinaryRecord",
  disciplinaryRecordSchema,
  "disciplinary-records"
);
