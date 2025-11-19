const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    student_ref: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    student_number: {
      type: String,
      required: true,
    },
    // ensures numerical values for easier filtering/sorting
    semester: { type: Number, required: true },   // 1 or 2
    acad_year: { type: Number, required: true },  // 1–4

    schedules: [
      {
        teacher_ref: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Teacher",
          default: null, // allow unassigned
        },
        subject_ref: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subject",
          required: true,
        },
        course_code: {
          type: String,
          required: true,
        },
        room: { type: String, required: true },
        day: { type: String, required: true },
        time: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
