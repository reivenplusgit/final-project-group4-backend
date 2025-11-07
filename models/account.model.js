const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    account_id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    photo: { type: String },
    user_type: {
      type: String,
      enum: ["student", "teacher", "admin"],
      required: true,
    },
    department: { type: String },
    status: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Account", accountSchema);
