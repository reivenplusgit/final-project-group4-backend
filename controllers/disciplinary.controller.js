// controllers/disciplinary.controller.js
const mongoose = require("mongoose");
const DisciplinaryRecord = require("../models/disciplinary.records.model.js");
const Teacher = require("../models/teacher.model.js");
const Account = require("../models/account.model.js");

// Helper: format each record so teachers_id has firstname, lastname, avatar
const formatRecord = (record) => {
  // record is a plain JS object because of .lean()
  const teacher = record.teachers_id || {};
  const teacherAccount = teacher.account_ref || {};

  return {
    ...record,
    teachers_id: {
      _id: teacher._id || null,
      firstname: teacherAccount.firstname || "Unknown",
      lastname: teacherAccount.lastname || "Teacher",
      avatar: teacherAccount.photo || "/default-avatar.png",
    },
  };
};

// Common populate definition
const disciplinaryPopulate = [
  {
    path: "teachers_id",
    populate: {
      path: "account_ref",
      model: "Account",
      select: "firstname lastname photo",
    },
  },
];

// ✅ Get all disciplinary records
// GET ALL RECORDS — OR FILTER BY STUDENT NUMBER
const getRecords = async (req, res) => {
  try {
    const { student } = req.query;  // ← NEW: ?student=2025848281

    // Build query
    const query = student ? { student_number: student } : {};

    const records = await DisciplinaryRecord.find(query)
      .populate(disciplinaryPopulate)
      .lean()
      .sort({ date: -1 }); // newest first

    const formatted = records.map(formatRecord);

    res.status(200).json({
      message: student 
        ? "Your disciplinary records retrieved successfully" 
        : "All disciplinary records retrieved",
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get single record by ID
const getRecord = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid record ID." });
    }

    const record = await DisciplinaryRecord.findById(id)
      .populate(disciplinaryPopulate)
      .lean();

    if (!record) {
      return res.status(404).json({ message: "Record not found." });
    }

    res.status(200).json({
      message: "Disciplinary record retrieved successfully!",
      data: formatRecord(record),
    });
  } catch (error) {
    console.error("Error getting record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Create a new record
// ✅ Create a new record
const createRecord = async (req, res) => {
  try {
    let {
      teachers_id,
      student_number,
      violation,
      sanction,
      severity,
      remarks = "",
      date = new Date().toISOString(),
    } = req.body;

    console.log("CREATE /disciplinary BODY:", req.body);

    // Normalize & trim
    student_number = (student_number ?? "").toString().trim();
    violation = (violation ?? "").trim();
    sanction = (sanction ?? "").trim();
    remarks = (remarks ?? "").trim();

    // Convert severity safely
    severity = Number(severity);
    if (isNaN(severity) || severity < 1 || severity > 5) {
      return res.status(400).json({ message: "Severity must be 1–5" });
    }

    // REQUIRED FIELDS (except teacher)
    if (!student_number || !violation || !sanction) {
      return res.status(400).json({ message: "Incomplete fields." });
    }

    // Teacher must be present separately
    if (!teachers_id) {
      return res.status(400).json({ message: "Missing teacher ID." });
    }

    // Auto-convert teacher (Account ID → Teacher ID)
    let teacherDoc = await Teacher.findOne({ account_ref: teachers_id });
    if (!teacherDoc) {
      teacherDoc = await Teacher.findById(teachers_id);
      if (!teacherDoc) {
        return res.status(400).json({ message: "Invalid teacher" });
      }
    }

    const record = await DisciplinaryRecord.create({
      teachers_id: teacherDoc._id,
      student_number,
      violation,
      sanction,
      severity,
      remarks,
      date,
    });

    const populated = await DisciplinaryRecord.findById(record._id)
      .populate(disciplinaryPopulate)
      .lean();

    res.status(201).json({
      message: "Record created successfully!",
      data: formatRecord(populated),
    });
  } catch (error) {
    console.error("Create record error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Edit record
const editRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      teachers_id,
      student_number,
      remarks,
      severity,
      date,
      sanction,
      violation,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Object ID!" });
    }

    if (
      !teachers_id ||
      !student_number ||
      !severity ||
      !date ||
      !sanction ||
      !violation
    ) {
      return res.status(400).json({ message: "Incomplete fields." });
    }

    if (severity < 1 || severity > 5) {
      return res.status(400).json({
        message: "Severity must be between 1 and 5.",
      });
    }

    const record = await DisciplinaryRecord.findByIdAndUpdate(
      id,
      { teachers_id, student_number, remarks, severity, date, sanction, violation },
      { new: true }
    )
      .populate(disciplinaryPopulate)
      .lean();

    if (!record) {
      return res.status(404).json({ message: "Record not found!" });
    }

    res.status(202).json({
      message: "Record successfully updated!",
      data: formatRecord(record),
    });
  } catch (error) {
    console.error("Error editing record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Delete one or more records
const deleteRecords = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid list of IDs." });
    }

    const deleted = await DisciplinaryRecord.deleteMany({ _id: { $in: ids } });

    if (deleted.deletedCount === 0) {
      return res.status(404).json({ message: "No matching records found." });
    }

    res.status(200).json({
      message: "Deleted disciplinary records successfully!",
      deletedCount: deleted.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting records:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getRecords,
  getRecord,
  createRecord,
  editRecord,
  deleteRecords,
};
