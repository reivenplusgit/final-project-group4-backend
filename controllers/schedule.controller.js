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



module.exports = { getSchedules};
