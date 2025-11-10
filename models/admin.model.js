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
      enum: ["sys_admin", "department_admin"], // extend if needed
      required: true,
    },
    department: {
      type: String,
      enum: ["IS", "CCS", "COE", "COS", "System"],
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
