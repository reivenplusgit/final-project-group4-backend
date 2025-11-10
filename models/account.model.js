// /models/Account.js
const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    account_id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }, // hashed
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    photo: { type: String, default: "" },
    user_type: {
      type: String,
      enum: ["Student", "Teacher", "Admin"],
      default: "Student",
    },
    department: { type: String, default: "" },
    date_created: { type: Date, default: Date.now },
    last_login: { type: Date, default: null },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Banned"],
      default: "Active",
    },
  },
  {
    collection: "accounts", // ensure it maps to the 'accounts' collection
  }
);

module.exports = mongoose.model("Account", accountSchema);
