const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  subject_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  room: {
    type: String,
    required: true,
  },
  slots: {
    type: Number,
    required: true,
  },
  num_students: {
    type: Number,
    default: 0,
  },
});

const teacherSchema = new mongoose.Schema(
  {
    account_ref: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    teacher_uid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    departments: {
      type: [String],
      enum: ["IS", "CCS", "COE", "COS"],
      required: true,
    },
    subjects: {
      type: [subjectSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "teachers",
  }
);

const Teacher = mongoose.model("Teacher", teacherSchema);

module.exports = Teacher;
