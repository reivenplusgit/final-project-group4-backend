const express = require("express");
const router = express.Router();

const {
  getRecords,
  getRecord,
  createRecord,
  editRecord,
  deleteRecords,
} = require("../controllers/disciplinary.controller");

router.get("/", getRecords);
router.get("/:id", getRecord);
router.post("/", createRecord);
router.put("/:id", editRecord);
router.delete("/", deleteRecords);

module.exports = router;
