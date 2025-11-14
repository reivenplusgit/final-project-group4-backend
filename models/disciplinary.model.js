const mongoose = require("mongoose");

const disciplinarySchema = new mongoose.Schema(
  {
    teachers_id: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    student_number: { type: Number, required: true },
    remarks: { type: String, required: true },
    severity: { type: Number, required: true, min: 1, max: 5 },
    date: { type: Date, required: true },
    sanction: { type: String, required: true },
    violation: { type: String, required: true },
  },
  { timestamps: true,
    collection: "disciplinary-records"
   }
);

module.exports = mongoose.model("DisciplinaryRecord", disciplinarySchema);
