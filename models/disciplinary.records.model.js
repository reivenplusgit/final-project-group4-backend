const mongoose = require("mongoose");

const disciplinaryRecordSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  remarks: String,
  severity:  { type: Number, required: true },
  date:  { type: Date, required: true }
}, { timestamps: true, collection: "disciplinary_records" });

module.exports = mongoose.model("Disciplinary Records", disciplinaryRecordSchema);