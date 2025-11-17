const Schedule = require("../models/schedule.model.js");
require("../models/student.model.js");
require("../models/teacher.model.js");
require("../models/subject.model.js");
const Account = require("../models/account.model.js");  // added by WJG
const Student = require("../models/student.model.js");
const bcrypt = require("bcryptjs");

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

/*  NEW: GET SCHEDULE FOR SPECIFIC STUDENT (AY + SEM FILTER) - Required by StudentSchedulePage */
const getScheduleByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    let { acad_year, semester } = req.query;

    acad_year = Number(acad_year);
    semester = Number(semester);

    const filter = { student_ref: studentId };
    if (!isNaN(acad_year)) filter.acad_year = acad_year;
    if (!isNaN(semester)) filter.semester = semester;

    const schedule = await Schedule.findOne(filter)
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
        select: "account_ref",
        populate: {
          path: "account_ref",
          model: "Account",
          select: "firstname lastname",
        },
      })
      .populate("schedules.subject_ref", "subject_name code");

    res.status(200).json({
      message: "Schedule retrieved successfully",
      data: schedule || null,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* NEW: CREATE EMPTY SCHEDULE (For + Create Schedule button)*/
const createSchedule = async (req, res) => {
  try {
    const { student_ref, student_number, semester, acad_year } = req.body;

    const newSched = await Schedule.create({
      student_ref,
      student_number,
      semester,
      acad_year,
      schedules: [],
    });

    res.status(201).json({
      message: "Schedule created successfully",
      data: newSched,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* NEW: ADD SUBJECT ENTRY TO SCHEDULE */
const addScheduleEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_ref, course_code, day, time, room } = req.body;

    const schedule = await Schedule.findById(id);
    if (!schedule)
      return res.status(404).json({ message: "Schedule not found" });

    schedule.schedules.push({
      subject_ref,
      course_code,
      day,
      time,
      room,
      teacher_ref: null,
    });

    await schedule.save();

    res.status(200).json({
      message: "Subject added successfully",
      data: schedule,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* NEW: UPDATE A SUBJECT ENTRY */
const updateScheduleEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { course_code, updates } = req.body;

    const updated = await Schedule.findOneAndUpdate(
      { _id: id, "schedules.course_code": course_code },
      { $set: { "schedules.$": updates } },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Schedule entry not found" });

    res.status(200).json({
      message: "Schedule entry updated successfully",
      data: updated,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* NEW: ASSIGN TEACHER */
const assignTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { course_code, teacher_ref } = req.body;

    const updated = await Schedule.findOneAndUpdate(
      { _id: id, "schedules.course_code": course_code },
      { $set: { "schedules.$.teacher_ref": teacher_ref } },
      { new: true }
    );

    res.status(200).json({
      message: "Teacher assigned",
      data: updated,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* NEW: DELETE MULTIPLE SUBJECTS */
const deleteScheduleEntries = async (req, res) => {
  try {
    const { id } = req.params;
    const { courseCodes } = req.body;

    const updated = await Schedule.findByIdAndUpdate(
      id,
      { $pull: { schedules: { course_code: { $in: courseCodes } } } },
      { new: true }
    );

    res.status(200).json({
      message: "Subjects deleted successfully",
      data: updated,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*NEW: ADD STUDENT (for the +add student button sa student reports page) */

const addStudent = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      password,
      student_number,
      year_level,
      department,
      course,
    } = req.body;

    if (!firstname || !lastname || !email || !password || !student_number) {
      return res
        .status(400)
        .json({ message: "Missing required fields." });
    }

    const emailExists = await Account.findOne({ email });
    if (emailExists) {
      return res
        .status(409)
        .json({ message: "Email already exists." });
    }

    const snExists = await Student.findOne({ student_number });
    if (snExists) {
      return res
        .status(409)
        .json({ message: "Student number already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAccount = await Account.create({
      account_id: `ACC-${Date.now()}`,
      firstname,
      lastname,
      email,
      password: hashedPassword,
      user_type: "Student",
      department,
      status: "Active",
    });

    const newStudent = await Student.create({
      accounts_ref: newAccount._id,
      student_number,
      year_level,
      department,
      course,
    });

    res.status(201).json({
      message: "Student created successfully!",
      data: {
        account: newAccount,
        student: newStudent,
      },
    });
  } catch (error) {
    console.error("addStudent error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



module.exports = { getSchedules, getScheduleByStudent, createSchedule, addScheduleEntry, updateScheduleEntry, assignTeacher, deleteScheduleEntries, addStudent}; // WJG: added new exports