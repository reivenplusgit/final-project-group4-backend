const Teacher = require("../models/teacher.model");
const mongoose = require("mongoose");

// ✅ Get all teachers
const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate(
      "account_ref",
      "firstname lastname email department user_type"
    );
    res.status(200).json({
      message: "Teachers retrieved successfully!",
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve teachers", error: error.message });
  }
};

// ✅ Get one teacher
const getTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid Teacher ID" });

    const teacher = await Teacher.findById(id).populate(
      "account_ref",
      "firstname lastname email department user_type"
    );
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    res
      .status(200)
      .json({ message: "Teacher retrieved successfully!", data: teacher });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve teacher", error: error.message });
  }
};

// ✅ Create a new teacher
const createTeacher = async (req, res) => {
  try {
    const { account_ref, teacher_uid, departments, subjects } = req.body;

    const existingTeacher = await Teacher.findOne({ teacher_uid });
    if (existingTeacher)
      return res.status(409).json({ message: "Teacher UID already exists" });

    const newTeacher = new Teacher({
      account_ref,
      teacher_uid,
      departments,
      subjects,
    });

    await newTeacher.save();
    res
      .status(201)
      .json({ message: "Teacher created successfully!", data: newTeacher });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create teacher", error: error.message });
  }
};

// ✅ Update teacher
const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid Teacher ID" });

    const updatedTeacher = await Teacher.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedTeacher)
      return res.status(404).json({ message: "Teacher not found" });

    res
      .status(200)
      .json({ message: "Teacher updated successfully!", data: updatedTeacher });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update teacher", error: error.message });
  }
};

// ✅ Delete teacher
const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid Teacher ID" });

    const deletedTeacher = await Teacher.findByIdAndDelete(id);
    if (!deletedTeacher)
      return res.status(404).json({ message: "Teacher not found" });

    res.status(200).json({ message: "Teacher deleted successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete teacher", error: error.message });
  }
};

const getTeacherByAccID = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid Account ID" });

    const teacher = await Teacher.findOne({
      account_ref: new mongoose.Types.ObjectId(id),
    }).populate("subjects.subject_id", "subject_name")
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    res
      .status(200)
      .json({ message: "Teacher retrieved successfully!", data: teacher });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve teacher", error: error.message });
  }
};

module.exports = {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherByAccID,
};
