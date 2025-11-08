const Admin = require("../models/admin.model");
const mongoose = require("mongoose");

// ✅ Get all admins
const getAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find().populate("accounts_ref", "firstname lastname email department user_type");
    res.status(200).json({
      message: "Admins retrieved successfully!",
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve admins", error: error.message });
  }
};

// ✅ Get one admin by ID
const getAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid Admin ID" });

    const admin = await Admin.findById(id).populate("accounts_ref", "firstname lastname email department user_type");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json({
      message: "Admin retrieved successfully!",
      data: admin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve admin", error: error.message });
  }
};

// ✅ Create new admin
const createAdmin = async (req, res, next) => {
  try {
    const { accounts_ref, admin_id, admin_level, department } = req.body;

    // Check for duplicates
    const existingAdmin = await Admin.findOne({ admin_id });
    if (existingAdmin)
      return res.status(409).json({ message: "Admin ID already exists" });

    const newAdmin = new Admin({
      accounts_ref,
      admin_id,
      admin_level,
      department,
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Admin created successfully!",
      data: newAdmin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create admin", error: error.message });
  }
};

// ✅ Update admin
const updateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid Admin ID" });

    const updatedAdmin = await Admin.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedAdmin)
      return res.status(404).json({ message: "Admin not found" });

    res.status(200).json({
      message: "Admin updated successfully!",
      data: updatedAdmin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update admin", error: error.message });
  }
};

// ✅ Delete admin
const deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid Admin ID" });

    const deletedAdmin = await Admin.findByIdAndDelete(id);
    if (!deletedAdmin)
      return res.status(404).json({ message: "Admin not found" });

    res.status(200).json({ message: "Admin deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete admin", error: error.message });
  }
};

module.exports = {
  getAdmins,
  getAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};
