const mongoose = require("mongoose");
const Student = require("../models/student.model.js");
const Schedule = require("../models/schedule.model.js");
const Teacher = require("../models/teacher.model.js");
const Disciplinary = require("../models/disciplinary.records.model.js");
const Account = require("../models/account.model.js");

const getNumOfStudents = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "ObjectID is not valid" });
    }

    const schedule = await Schedule.aggregate([
      { $unwind: "$schedules" },
      { $match: { "schedules.teacher_ref": new mongoose.Types.ObjectId(id) } },
      { $count: "total" },
    ]);

    if (!schedule) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json({
      message: "Number of students with records retrieved",
      data: schedule,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log({ message: error.message });
  }
};

const getDBStatistics = async (req, res) => {
  try {
    const studentsTotal = await Student.countDocuments({});
    const teachersTotal = await Teacher.countDocuments({});
    const disciplinaryTotal = await Disciplinary.countDocuments({});
    const classesQuery = await Teacher.aggregate([
      { $unwind: "$subjects" },
      { $count: "total" },
    ]);
    const classesTotal = classesQuery[0]?.total || 0;
    const departmentQuery = await Teacher.aggregate([
      { $unwind: "$departments" },
      { $group: { _id: "$departments" } },
      { $count: "total" },
    ]);
    const departmentTotal = departmentQuery[0]?.total || 0;
    const departmentDistributionQuery = await Student.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const departmentDistri = departmentDistributionQuery;

    res.status(200).json({
      message: "Statistics Retrieved Successfully!",
      data: {
        students: studentsTotal,
        teachers: teachersTotal,
        disciplinary: disciplinaryTotal,
        classes: classesTotal,
        department: departmentTotal,
        departmentDistribution: departmentDistri
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log({ message: error.message });
  }
};

module.exports = {
  getNumOfStudents,
  getDBStatistics,
};
