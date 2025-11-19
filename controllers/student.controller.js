const Student = require("../models/student.model");
const mongoose = require("mongoose");

const populateFields = "firstname lastname email photo department user_type date_created";

const populate = { path: "accounts_ref", select: populateFields };

const sendError = (res, message, error, code = 500) =>
  res.status(code).json({ message, error: error?.message });

const isValid = (id) => mongoose.Types.ObjectId.isValid(id);

// Get all students
const getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate(populate);
    res.status(200).json({
      message: "Students retrieved successfully!",
      count: students.length,
      data: students,
    });
  } catch (err) {
    sendError(res, "Failed to retrieve students", err);
  }
};

// Get student by ID
const getStudent = async (req, res) => {
  const { id } = req.params;
  if (!isValid(id)) return sendError(res, "Invalid Student ID", null, 400);

  try {
    const student = await Student.findById(id).populate(populate);
    if (!student)
      return sendError(res, "Student not found", null, 404);

    res.status(200).json({
      message: "Student retrieved successfully!",
      data: student,
    });
  } catch (err) {
    sendError(res, "Failed to retrieve student", err);
  }
};

// Get student by Account
const getStudentByAccount = async (req, res) => {
  const { accountId } = req.params;
  if (!isValid(accountId))
    return sendError(res, "Invalid account ID", null, 400);

  try {
    const student = await Student.findOne({ accounts_ref: accountId }).populate(populate);

    if (!student)
      return sendError(res, "Student not found", null, 404);

    res.status(200).json({
      message: "Student retrieved successfully!",
      data: student,
    });
  } catch (err) {
    sendError(res, "Failed to retrieve student", err);
  }
};

// Create student
const createStudent = async (req, res) => {
  try {
    const exists = await Student.findOne({ student_number: req.body.student_number });
    if (exists)
      return sendError(res, "Student number already exists", null, 409);

    const newStudent = await Student.create(req.body);

    res.status(201).json({
      message: "Student created successfully!",
      data: newStudent,
    });
  } catch (err) {
    sendError(res, "Failed to create student", err);
  }
};

// Update student
const updateStudent = async (req, res) => {
  const { id } = req.params;
  if (!isValid(id)) return sendError(res, "Invalid Student ID", null, 400);

  try {
    const updated = await Student.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated)
      return sendError(res, "Student not found", null, 404);

    res.status(200).json({
      message: "Student updated successfully!",
      data: updated,
    });
  } catch (err) {
    sendError(res, "Failed to update student", err);
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  const { id } = req.params;
  if (!isValid(id)) return sendError(res, "Invalid Student ID", null, 400);

  try {
    const deleted = await Student.findByIdAndDelete(id);
    if (!deleted)
      return sendError(res, "Student not found", null, 404);

    res.status(200).json({ message: "Student deleted successfully!" });
  } catch (err) {
    sendError(res, "Failed to delete student", err);
  }
};

module.exports = {
  getStudents,
  getStudent,
  getStudentByAccount,
  createStudent,
  updateStudent,
  deleteStudent,
};
