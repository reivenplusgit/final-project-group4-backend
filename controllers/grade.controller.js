const Grade = require("../models/grade.model"); // ✅ ensure correct filename
const mongoose = require("mongoose");
const Teacher = require("../models/teacher.model");
const Schedule = require("../models/schedule.model");
const Student = require("../models/student.model");
const Account = require("../models/account.model");

// ✅ Get all grades
// GET ALL GRADES — OR FILTER BY STUDENT NUMBER (THIS IS THE MISSING PIECE)
const getGrades = async (req, res) => {
  try {
    const { student } = req.query;  // ← THIS LINE WAS MISSING!
    // Build query: if ?student=2025848281 → filter, else return all
    const query = student ? { student_number: String(student) } : {};

    const grades = await Grade.find(query)
      .populate("grades.teacher_ref", "teacher_uid departments")
      .populate("grades.subject_ref", "subject_id subject_name")
      .lean();

    res.status(200).json({
      message: "Grades retrieved successfully!",
      count: grades.length,
      data: grades,
    });
  } catch (error) {
    console.error("Error fetching grades:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
    res
      .status(500)
      .json({ message: "Failed to retrieve grade", error: error.message });
  }
};

// ✅ Create new grade record
const createGrade = async (req, res) => {
  try {
    const { student_number, semester, acad_year, grades } = req.body;

    // Check all references are valid ObjectIds
    if (
      !Array.isArray(grades) ||
      grades.some((g) => !mongoose.Types.ObjectId.isValid(g.teacher_ref))
    )
      return res
        .status(400)
        .json({ message: "Invalid teacher_ref in grades array" });

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
    res
      .status(500)
      .json({ message: "Failed to create grade", error: error.message });
  }
};

// ✅ Update existing grade record
const updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid Grade ID" });

    const updatedGrade = await Grade.findByIdAndUpdate(id, req.body, {
      new: true,
    })
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
    res
      .status(500)
      .json({ message: "Failed to update grade", error: error.message });
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
    res
      .status(500)
      .json({ message: "Failed to delete grade", error: error.message });
  }
};

const getStudentsByTeacherAndSubject = async (req, res) => {
  try {
    let { teacherId, subjectId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(teacherId) || !mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: "Invalid teacher or subject ID" });
    }

    // CRITICAL: Convert Account ID → Teacher document ID if needed
    const teacherDoc = await Teacher.findOne({ account_ref: teacherId });
    if (teacherDoc) {
      teacherId = teacherDoc._id.toString();
    }

    // DIRECTLY QUERY THE SCHEDULE COLLECTION — NO HTTP, NO EXTERNAL CALLS
    const schedules = await Schedule.find({
      "schedules": {
        $elemMatch: {
          teacher_ref: teacherId,
          subject_ref: subjectId,
        },
      },
    }).populate({
      path: "student_ref",
      populate: {
        path: "accounts_ref",
        select: "firstname lastname photo",
      },
      select: "student_number course phone",
    });

    // Extract unique enrolled students
    const enrolledStudents = [];
    const seen = new Set();

    for (const sched of schedules) {
      const student = sched.student_ref;
      if (student && !seen.has(student._id.toString())) {
        seen.add(student._id.toString());
        enrolledStudents.push({
          _id: student._id,
          student_number: student.student_number,
          firstname: student.accounts_ref?.firstname || "Unknown",
          lastname: student.accounts_ref?.lastname || "Unknown",
          photo: student.accounts_ref?.photo || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
          course: student.course || "N/A",
          phone: student.phone || "N/A",
        });
      }
    }

    // Get grades using the correct teacherId
    const gradeRecords = await Grade.find({
      "grades": {
        $elemMatch: {
          teacher_ref: teacherId,
          subject_ref: subjectId,
        },
      },
    });

    const gradeMap = {};
    gradeRecords.forEach(record => {
      const entry = record.grades.find(g =>
        g.teacher_ref.toString() === teacherId &&
        g.subject_ref.toString() === subjectId
      );
      if (entry) {
        gradeMap[record.student_number] = {
          percent: entry.percent || null,
          graded_date: entry.graded_date || null,
          status: entry.percent >= 75 ? "Passed" : entry.percent != null ? "Failed" : "Not Graded",
        };
      }
    });

    // Combine enrolled students + grades
    const students = enrolledStudents.map(student => ({
      ...student,
      ...(gradeMap[student.student_number] || {
        percent: null,
        graded_date: null,
        status: "Not Graded",
      }),
    }));

    res.status(200).json({
      message: "Students retrieved successfully",
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error("Error in getStudentsByTeacherAndSubject:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// grade.controller.js
const updateStudentGrade = async (req, res) => {
  try {
    const { student_number, subjectId } = req.params;
    const { percent, teacher_ref } = req.body;

    const gradeRecord = await Grade.findOne({ student_number });
    if (!gradeRecord) {
      return res.status(404).json({ message: "Student grade record not found" });
    }

    const gradeEntry = gradeRecord.grades.find(
      g => g.subject_ref.toString() === subjectId && g.teacher_ref.toString() === teacher_ref
    );

    if (!gradeEntry) {
      gradeRecord.grades.push({
        teacher_ref,
        subject_ref: subjectId,
        percent,
        graded_date: percent ? new Date() : null,
      });
    } else {
      gradeEntry.percent = percent;
      gradeEntry.graded_date = percent ? new Date() : null;
    }

    await gradeRecord.save();

    res.status(200).json({ message: "Grade updated successfully", data: gradeRecord });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getGrades,
  getGrade,
  createGrade,
  updateGrade,
  deleteGrade,
  updateStudentGrade,
  getStudentsByTeacherAndSubject,
};
