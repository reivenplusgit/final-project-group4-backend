const mongoose = require("mongoose");
const DisciplinaryRecord = require("../models/disciplinary.model.js");

// ✅ Get all disciplinary records
const getRecords = async (req, res) => {
  try {
    const records = await DisciplinaryRecord.find({});
    res.status(200).json({
      message: "Disciplinary records retrieved successfully!",
      data: records,
    });
  } catch (error) {
    console.error("Error fetching records:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get single record by ID
const getRecord = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid record ID." });

    const record = await DisciplinaryRecord.findById(id);
    if (!record)
      return res.status(404).json({ message: "Record not found." });

    res.status(200).json({
      message: "Disciplinary record retrieved successfully!",
      data: record,
    });
  } catch (error) {
    console.error("Error getting record:", error.message);
    res.status(500).json({ message: error.message });
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

    // Validate student_number in Accounts DB
    const studentExists = await Account.findOne({
      account_id: student_number,
      user_type: "Student",
    });

    if (!studentExists) {
      return res.status(400).json({
        message: "Student number does not exist in student database.",
      });
    }

    if (severity < 1 || severity > 5) {
      return res.status(400).json({
        message: "Severity must be between 1 and 5.",
      });
    }

    const record = await DisciplinaryRecord.create({
      teachers_id,
      student_number,
      remarks,
      severity,
      date,
      sanction,
      violation,
    });

    res.status(201).json({
      message: "New disciplinary record created successfully!",
      data: record,
    });

  } catch (error) {
    console.error("Error creating record:", error.message);
    res.status(500).json({ message: error.message });
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

    const record = await DisciplinaryRecord.findByIdAndUpdate(
      id,
      { teachers_id, student_number, remarks, severity, date, sanction, violation },
      { new: true }
    );

    if (!record)
      return res.status(404).json({ message: "Record not found!" });

    res.status(202).json({
      message: "Record successfully updated!",
      data: record,
    });
  } catch (error) {
    console.error("Error editing record:", error.message);
    res.status(500).json({ message: error.message });
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

    if (deleted.deletedCount === 0)
      return res.status(404).json({ message: "No matching records found." });

    res.status(200).json({
      message: "Deleted disciplinary records successfully!",
      deletedCount: deleted.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting records:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRecords,
  getRecord,
  createRecord,
  editRecord,
  deleteRecords,
};
