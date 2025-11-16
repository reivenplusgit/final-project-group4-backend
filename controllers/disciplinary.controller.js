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
const getRecords = async (req, res) => {
  try {
    const records = await DisciplinaryRecord.find({})
      .populate(disciplinaryPopulate)
      .lean(); // plain objects

    const formatted = records.map(formatRecord);

    res.status(200).json({
      message: "Disciplinary records retrieved successfully!",
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
const createRecord = async (req, res) => {
  try {
    const {
      teachers_id,
      student_number,
      remarks,
      severity,
      date,
      sanction,
      violation,
    } = req.body;

    // Required fields
    if (
      !teachers_id ||
      !student_number ||
      !remarks ||
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

    // NOTE: here teachers_id must already be a Teacher._id
    // (your patch script + AddDisciplinaryModal handle this mapping)

    const record = await DisciplinaryRecord.create({
      teachers_id,
      student_number,
      remarks,
      severity,
      date,
      sanction,
      violation,
    });

    const populated = await record
      .populate(disciplinaryPopulate)
      .then((doc) => doc.toObject());

    res.status(201).json({
      message: "New disciplinary record created successfully!",
      data: formatRecord(populated),
    });
  } catch (error) {
    console.error("Error creating record:", error);
    res.status(500).json({ message: "Internal server error" });
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
      !remarks ||
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
