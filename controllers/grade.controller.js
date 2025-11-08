const Grade = require("../models/grade.model"); // ✅ ensure correct filename
const mongoose = require("mongoose");

// ✅ Get all grades
const getGrades = async (req, res) => {
  try {
    const grades = await Grade.find()
      // ✅ populate inside nested "grades" array — note the path
      .populate("grades.teacher_ref", "teacher_uid departments")
      .populate("grades.subject_ref", "subject_id subject_name");

    res.status(200).json({
      message: "Grades retrieved successfully!",
      count: grades.length,
      data: grades,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve grades", error: error.message });
  }
};

// ✅ Get one grade record by ID
const getGrade = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid Grade ID" });

    const grade = await Grade.findById(id)
      .populate("grades.teacher_ref", "teacher_uid departments")
      .populate("grades.subject_ref", "subject_id subject_name");

    if (!grade)
      return res.status(404).json({ message: "Grade record not found" });

    res.status(200).json({
      message: "Grade record retrieved successfully!",
      data: grade,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve grade", error: error.message });
  }
};

// ✅ Create new grade record
const createGrade = async (req, res) => {
  try {
    const { student_number, semester, acad_year, grades } = req.body;

    // Check all references are valid ObjectIds
    if (!Array.isArray(grades) || grades.some(g => !mongoose.Types.ObjectId.isValid(g.teacher_ref)))
      return res.status(400).json({ message: "Invalid teacher_ref in grades array" });

    const newGrade = new Grade({
      student_number,
      semester,
      acad_year,
      grades,
    });

    await newGrade.save();

    // Populate the response
    const populatedGrade = await Grade.findById(newGrade._id)
      .populate("grades.teacher_ref", "teacher_uid departments")
      .populate("grades.subject_ref", "subject_id subject_name");

    res.status(201).json({
      message: "Grade record created successfully!",
      data: populatedGrade,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create grade", error: error.message });
  }
};

// ✅ Update existing grade record
const updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid Grade ID" });

    const updatedGrade = await Grade.findByIdAndUpdate(id, req.body, { new: true })
      .populate("grades.teacher_ref", "teacher_uid departments")
      .populate("grades.subject_ref", "subject_id subject_name");

    if (!updatedGrade)
      return res.status(404).json({ message: "Grade record not found" });

    res.status(200).json({
      message: "Grade record updated successfully!",
      data: updatedGrade,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update grade", error: error.message });
  }
};

// ✅ Delete grade record
const deleteGrade = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid Grade ID" });

    const deletedGrade = await Grade.findByIdAndDelete(id);
    if (!deletedGrade)
      return res.status(404).json({ message: "Grade record not found" });

    res.status(200).json({ message: "Grade record deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete grade", error: error.message });
  }
};

module.exports = {
  getGrades,
  getGrade,
  createGrade,
  updateGrade,
  deleteGrade,
};
