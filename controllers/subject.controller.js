const mongoose = require("mongoose");
const Subject = require("../models/subject.model.js");

getSubjects = async (req, res) => {
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

getSubject = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Subject ID is not valid." });
      console.log(`Subject ID ${PORT} is not valid`);
    }

    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ message: "Subject ID was not found." });
      console.log(`Subject ID ${PORT} was not found.`);
    }
    res
      .status(200)
      .json({ message: "Subject retrieved sucessfully!", data: subject });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log({ message: error.message });
  }
};

module.exports = {
  getSubjects,
  getSubject
};
