const mongoose = require("mongoose");

const disciplinaryRecordSchema = new mongoose.Schema(
  {
    teachers_id: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    student_number: { type: String, required: true},
    remarks: { type: String},
    severity: { type: Number, required: true, min: 1, max: 5 },
    date: { type: Date, required: true },
    sanction: { type: String, required: true},
    violation: { type: String, required: true },
  },
  { timestamps: true,
    collection: "disciplinary-records"
  }
);

module.exports = mongoose.model(
  "DisciplinaryRecord",
  disciplinaryRecordSchema
);
