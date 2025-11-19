const Grade = require("../models/grade.model");
const mongoose = require("mongoose");
const Teacher = require("../models/teacher.model");
const Schedule = require("../models/schedule.model");
const Student = require("../models/student.model");
const Account = require("../models/account.model");

// GET GRADES (FILTER BY student_ref)
// GET GRADES (FILTER BY student_ref or student_number)
// GET GRADES (FILTER BY student_ref, can accept studentId or student_number)
const getGrades = async (req, res) => {
  try {
    const { studentId, student, studentNumber } = req.query;

    const query = {};

    // Decide how to resolve student_ref (ObjectId)
    let studentRefId = null;

    // 1) Directly via ?studentId=<ObjectId>
    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
      studentRefId = studentId;
    } else if (student || studentNumber) {
      // 2) Via student number (?student= / ?studentNumber=)
      const studNo = student || studentNumber;

      const studentDoc = await Student.findOne({
        student_number: studNo,
      }).select("_id student_number");

      // If no student found for that number, just return empty list
      if (!studentDoc) {
        return res.status(200).json({
          message: "No grades found for this student",
          count: 0,
          data: [],
        });
      }

      studentRefId = studentDoc._id;
    }

    // Apply filter if we resolved a student_ref
    if (studentRefId) {
      query.student_ref = studentRefId;
    }

    const grades = await Grade.find(query)
      .populate("grades.teacher_ref", "teacher_uid departments")
      .populate("grades.subject_ref", "subject_id subject_name")
      .populate({
        path: "student_ref",
        select: "student_number accounts_ref",
        populate: {
          path: "accounts_ref",
          select: "firstname lastname photo",
        },
      })
      .lean();

    res.status(200).json({
      message: "Grades retrieved successfully",
      count: grades.length,
      data: grades,
    });
  } catch (error) {
    console.error("Error fetching grades:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET ONE GRADE
const getGrade = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid Grade ID" });

    const grade = await Grade.findById(id)
      .populate("grades.teacher_ref", "teacher_uid departments")
      .populate("grades.subject_ref", "subject_id subject_name")
      .populate({
        path: "student_ref",
        select: "student_number accounts_ref",
        populate: {
          path: "accounts_ref",
          select: "firstname lastname photo",
        },
      });

    if (!grade)
      return res.status(404).json({ message: "Grade record not found" });

    res.status(200).json({
      message: "Grade record retrieved successfully",
      data: grade,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve grade", error: error.message });
  }
};

// CREATE GRADE (uses student_ref)
const createGrade = async (req, res) => {
  try {
    const { student_ref, student_number, semester, acad_year, grades } = req.body;

    if (!student_ref || !mongoose.Types.ObjectId.isValid(student_ref)) {
      return res.status(400).json({ message: "Invalid or missing student_ref" });
    }

    if (!Array.isArray(grades) || grades.length === 0) {
      return res.status(400).json({ message: "grades array cannot be empty" });
    }

    const invalidTeacher = grades.some(g => !mongoose.Types.ObjectId.isValid(g.teacher_ref));
    const invalidSubject = grades.some(g => !mongoose.Types.ObjectId.isValid(g.subject_ref));

    if (invalidTeacher || invalidSubject) {
      return res.status(400).json({ message: "Invalid teacher_ref or subject_ref" });
    }

    const newGrade = new Grade({
      student_ref,
      student_number,
      semester,
      acad_year,
      grades,
    });

    await newGrade.save();

    const populatedGrade = await Grade.findById(newGrade._id)
      .populate("grades.teacher_ref", "teacher_uid departments")
      .populate("grades.subject_ref", "subject_id subject_name")
      .populate({
        path: "student_ref",
        select: "student_number accounts_ref",
        populate: { path: "accounts_ref", select: "firstname lastname photo" },
      });

    res.status(201).json({
      message: "Grade record created successfully",
      data: populatedGrade,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create grade", error: error.message });
  }
};

// UPDATE GRADE RECORD
const updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid Grade ID" });

    const updated = await Grade.findByIdAndUpdate(id, req.body, { new: true })
      .populate("grades.teacher_ref", "teacher_uid departments")
      .populate("grades.subject_ref", "subject_id subject_name")
      .populate({
        path: "student_ref",
        select: "student_number accounts_ref",
        populate: { path: "accounts_ref", select: "firstname lastname photo" },
      });

    if (!updated)
      return res.status(404).json({ message: "Grade record not found" });

    res.status(200).json({
      message: "Grade record updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update grade", error: error.message });
  }
};

// DELETE GRADE RECORD
const deleteGrade = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid Grade ID" });

    const deleted = await Grade.findByIdAndDelete(id);

    if (!deleted)
      return res.status(404).json({ message: "Grade record not found" });

    res.status(200).json({ message: "Grade deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete grade", error: error.message });
  }
};

// TEACHER GETS STUDENT LIST
const getStudentsByTeacherAndSubject = async (req, res) => {
  try {
    let { teacherId, subjectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(teacherId) ||
        !mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: "Invalid teacher or subject ID" });
    }

    // Convert teacher account_ref → teacher._id
    const teacherDoc = await Teacher.findOne({ account_ref: teacherId });
    if (teacherDoc) teacherId = teacherDoc._id.toString();

    const schedules = await Schedule.find({
      schedules: {
        $elemMatch: {
          teacher_ref: teacherId,
          subject_ref: subjectId,
        },
      },
    }).populate({
      path: "student_ref",
      select: "student_number course phone accounts_ref",
      populate: { path: "accounts_ref", select: "firstname lastname photo" },
    });

    const enrolledStudents = [];
    const seen = new Set();

    for (const s of schedules) {
      const st = s.student_ref;
      if (st && !seen.has(st._id.toString())) {
        seen.add(st._id.toString());
        enrolledStudents.push({
          _id: st._id,
          student_number: st.student_number,
          firstname: st.accounts_ref?.firstname,
          lastname: st.accounts_ref?.lastname,
          photo: st.accounts_ref?.photo,
          course: st.course,
          phone: st.phone,
        });
      }
    }

    // Map existing grades
    const gradeRecords = await Grade.find({
      grades: {
        $elemMatch: {
          teacher_ref: teacherId,
          subject_ref: subjectId,
        },
      },
    });

    const gradeMap = {};
    gradeRecords.forEach((record) => {
      const entry = record.grades.find(
        g => g.teacher_ref.toString() === teacherId &&
             g.subject_ref.toString() === subjectId
      );

      if (entry) {
        gradeMap[record.student_ref.toString()] = {
          percent: entry.percent,
          graded_date: entry.graded_date,
          status: entry.percent >= 75 ? "Passed" : "Failed",
        };
      }
    });

    // Combine
    const students = enrolledStudents.map(st => ({
      ...st,
      ...(gradeMap[st._id.toString()] || {
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
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// UPDATE ONE GRADE ENTRY (teacher edits a student's grade for a specific subject)
const updateStudentGradeBySubject = async (req, res) => {
  try {
    const { student_number, subjectId } = req.params;
    const { teacher_ref, percent } = req.body;

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: "Invalid subjectId" });
    }
    if (!mongoose.Types.ObjectId.isValid(teacher_ref)) {
      return res.status(400).json({ message: "Invalid teacher_ref" });
    }

    // 1) Find the student's grade record
    const gradeDoc = await Grade.findOne({ student_number });

    if (!gradeDoc) {
      return res.status(404).json({ message: "Grade record not found" });
    }

    // 2) Find grade entry for this subject & teacher
    const entry = gradeDoc.grades.find(
      (g) =>
        g.subject_ref.toString() === subjectId &&
        g.teacher_ref.toString() === teacher_ref
    );

    if (!entry) {
      return res.status(404).json({
        message: "No grade entry found for this subject & teacher",
      });
    }

    // 3) Update fields
    entry.percent = percent;
    entry.graded_date = new Date();

    // 4) Save
    await gradeDoc.save();

    return res.status(200).json({
      message: "Grade updated successfully",
      data: gradeDoc,
    });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = {
  getGrades,
  getGrade,
  createGrade,
  updateGrade,
  deleteGrade,
  getStudentsByTeacherAndSubject,
  updateStudentGradeBySubject
};
