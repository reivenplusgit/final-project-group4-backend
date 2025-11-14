const mongoose = require("mongoose");
const Subject = require("../models/subject.model.js");

const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({});
    res
      .status(200)
      .json({ message: "Subjects retrieved successfully!", data: subjects });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log({ message: error.message });
  }
};

const getSubject = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`Subject ID ${PORT} is not valid`);
      return res.status(404).json({ message: "Subject ID is not valid." });
    }

    const subject = await Subject.findById(id);
    if (!subject) {
      console.log(`Subject ID ${PORT} was not found.`);
      return res.status(404).json({ message: "Subject ID was not found." });
    }
    res
      .status(200)
      .json({ message: "Subject retrieved sucessfully!", data: subject });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log({ message: error.message });
  }
};

const createSubject = async (req, res) => {
  try {
    const { _id, code, subject_name, units, department, year_level, semester } =
      req.body;

    // Validations
    if (
      !code ||
      !subject_name ||
      !units ||
      !department ||
      !year_level ||
      !semester
    ) {
      return res.status(400).json({ message: "Incomplete fields." });
    }

    const checkSubjectId = _id ? await Subject.findById(_id) : null;
    const checkSubjectCode = await Subject.findOne({ code });

    if (checkSubjectId || checkSubjectCode) {
      return res.status(400).json({
        message: "Subject already exists!",
        data: checkSubjectId || checkSubjectCode,
      });
    }

    if (units < 1) {
      return res.status(400).json({ message: "Unit cannot be less than 1." });
    }

    if (year_level < 1 || year_level > 12) {
      return res
        .status(400)
        .json({ message: "Year level must be between 1 and 12." });
    }

    if (semester < 1 || semester > 4) {
      return res
        .status(400)
        .json({ message: "Semester must be between 1 and 4." });
    }

    const validDepartments = ["CCS", "COS", "COE", "IS"];
    if (!validDepartments.includes(department)) {
      return res.status(400).json({
        message: "Invalid department. Must be one of: CCS, COS, COE or IS.",
      });
    }

    // Create new subjects
    const subject = await Subject.create({
      code,
      subject_name,
      units,
      department,
      year_level,
      semester,
    });

    res
      .status(201)
      .json({ message: "New subject entry added!", data: subject });
  } catch (error) {
    console.log({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

const editSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, subject_name, units, department, year_level, semester } =
      req.body;

    if (
      !code ||
      !subject_name ||
      !units ||
      !department ||
      !year_level ||
      !semester
    ) {
      return res.status(400).json({ message: "Incomplete fields." });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Object ID!" });
    }

    if (units < 1) {
      return res.status(400).json({ message: "Unit cannot be less than 1." });
    }

    if (year_level < 1 || year_level > 12) {
      return res
        .status(400)
        .json({ message: "Year level must be between 1 and 12." });
    }

    if (semester < 1 || semester > 4) {
      return res
        .status(400)
        .json({ message: "Semester must be between 1 and 4." });
    }

    const validDepartments = ["CCS", "COS", "COE", "IS"];
    if (!validDepartments.includes(department)) {
      return res.status(400).json({
        message: "Invalid department. Must be one of: CCS, COS, COE or IS.",
      });
    }

    const checkSubjectCode = await Subject.findOne({ code });

    if (checkSubjectCode._id.toString() !== id && checkSubjectCode) {
      return res.status(400).json({
        message: "Subject already exists!",
        data: checkSubjectCode,
      });
    }

    const subject = await Subject.findByIdAndUpdate(
      id,
      { code, subject_name, units, department, year_level, semester },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({ message: "Subject not found!" });
    }

    res
      .status(202)
      .json({ message: "Document successfully updated!", data: subject });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log({ message: error.message });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Error, invalid list of IDs" });
    }

    const deleted = await Subject.deleteMany({ _id: { $in: ids } });

    if (deleted.deletedCount === 0) {
      return res.status(404).json({ message: "No matching subjects found" });
    }

    res.status(200).json({
      message: "Deleted subjects successfully!",
      deletedCount: deleted.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error({ message: error.message });
  }
};

module.exports = {
  getSubjects,
  getSubject,
  createSubject,
  editSubject,
  deleteSubject
};
