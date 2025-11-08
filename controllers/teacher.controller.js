// controllers/teacher.controller.js
const mongoose = require("mongoose");
const Teacher = require("../models/teacher.model");

const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({})
      .populate("accountId")
      .populate("subjects.subjectId");
    res.status(200).json({ message: "Teachers retrieved successfully!", data: teachers });
  } catch (error) {
    console.log({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

const getTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Teacher ID is not valid." });
    }

    const teacher = await Teacher.findById(id)
      .populate("accountId")
      .populate("subjects.subjectId");

    if (!teacher) {
      return res.status(404).json({ message: "Teacher ID was not found." });
    }

    res.status(200).json({ message: "Teacher retrieved successfully!", data: teacher });
  } catch (error) {
    console.log({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTeachers,
  getTeacher,
};
