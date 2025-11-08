// controllers/admin.controller.js
const mongoose = require("mongoose");
const Admin = require("../models/admin.model");

const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({}).populate("accountId");
    res.status(200).json({ message: "Admins retrieved successfully!", data: admins });
  } catch (error) {
    console.log({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

const getAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Admin ID is not valid." });
    }

    const admin = await Admin.findById(id).populate("accountId");
    if (!admin) {
      return res.status(404).json({ message: "Admin ID was not found." });
    }

    res.status(200).json({ message: "Admin retrieved successfully!", data: admin });
  } catch (error) {
    console.log({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdmins,
  getAdmin,
};
