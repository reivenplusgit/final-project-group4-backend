const mongoose = require("mongoose");
const Schedule = require("../models/schedule.model.js");
require("../models/student.model.js");
require("../models/teacher.model.js");
require("../models/subject.model.js");

const getSchedules = async (req, res) => {
  try {
    // Retrieve schedules with linking from student, teacher, and subject
    const schedules = await Schedule.find({})
      .populate({
        path: "student_ref",
        select: "accounts_ref",
        populate: {
          path: "accounts_ref",
          model: "Account",
          select: "firstname lastname",
        },
      })
      .populate({
        path: "schedules.teacher_ref",
        select: "accounts_ref",
        populate: {
          path: "account_ref",
          model: "Account",
          select: "firstname lastname",
        },
      })
      .populate("schedules.subject_ref", "subject_name");

    res
      .status(200)
      .json({ message: "Schedule retrieved successfully", data: schedules });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log({ message: error.message });
  }
};

const getStudentsBySubjAndTeacherID = async (req, res) => {
  try {
    const { subjId, teacherId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(subjId) ||
      !mongoose.Types.ObjectId.isValid(teacherId)
    )
      return res.status(400).json({ message: "Invalid IDs" });

    const matches = await Schedule.aggregate([
      // 1. Filter schedules
      {
        $match: {
          schedules: {
            $elemMatch: {
              teacher_ref: new mongoose.Types.ObjectId(teacherId),
              subject_ref: new mongoose.Types.ObjectId(subjId),
            },
          },
        },
      },

      // 2. Join Student
      {
        $lookup: {
          from: "students",
          localField: "student_ref",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },

      // 3. Join Account
      {
        $lookup: {
          from: "accounts",
          localField: "student.accounts_ref",
          foreignField: "_id",
          as: "account",
        },
      },
      { $unwind: "$account" },

      // 4. Extract only needed fields, attach student._id as identity
      {
        $project: {
          _id: "$student._id",
          student_number: "$student.student_number",
          firstname: "$account.firstname",
          lastname: "$account.lastname",
          photo: "$account.photo",
          course: "$student.course",
          phone: "$student.phone",
        },
      },

      // 5. Deduplicate by student ID
      {
        $group: {
          _id: "$_id",
          student_number: { $first: "$student_number" },
          firstname: { $first: "$firstname" },
          lastname: { $first: "$lastname" },
          photo: { $first: "$photo" },
          course: {$first: "$course"},
          phone: { $first: "$phone"}
        },
      },

      // 6. Format output
      {
        $project: {
          _id: 1,
          student_number: 1,
          firstname: 1,
          lastname: 1,
          photo: 1,
          course: 1,
          phone: 1,
        },
      },
    ]);

    if (matches.length === 0)
      return res.status(404).json({ message: "404: No students found with your ID and subject ID!" });

    res
      .status(200)
      .json({ message: "Students retrieved successfully!", data: matches });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve Students", error: error.message });
  }
};

module.exports = { getSchedules, getStudentsBySubjAndTeacherID };
