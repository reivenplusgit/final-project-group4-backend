const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reports.controller");

// Routes
router.get("/numStudents/teacher/:id", reportController.getNumOfStudents);

module.exports = router;
