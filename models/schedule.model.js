const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    student_number: {
      type: String,
      ref: "Student",
      required: true,
    },
    semester: { type: String, required: true },
    acad_year: { type: String, required: true },
    schedules: [
      {
        teacher_ref: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Teacher",
          required: true,
        },
        course_code: {
          type: String,
          ref: "Subject",
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
