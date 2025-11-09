const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
  {
    student_number: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    acad_year: {
      type: String,
      required: true,
      trim: true,
    },
    grades: [
      {
        teacher_ref: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Teacher",
          required: true,
        },
        subject_ref: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subject",
          required: true,
        },
        percent: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
        graded_date: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
    collection: "grades",
  }
);

const Grade = mongoose.model("Grade", gradeSchema);

module.exports = Grade;
