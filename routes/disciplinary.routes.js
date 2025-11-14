const express = require("express");
const {
  getRecords,
  getRecord,
  createRecord,
  editRecord,
  deleteRecords,
} = require("../controllers/disciplinary.controller");

const router = express.Router();

router.get("/", getRecords);
router.get("/:id", getRecord);
router.post("/", createRecord);
router.put("/:id", editRecord);
router.delete("/", deleteRecords);

module.exports = router;
