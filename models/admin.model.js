const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    accounts_ref: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    admin_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    admin_level: {
      type: String,
      enum: ["department_admin"], // Removed sys_admin
      required: true,
      default: "department_admin",
    },
    department: {
      type: String,
      enum: ["IS", "CCS", "COE", "COS"], // Removed System
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "admin",
  }
);

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;