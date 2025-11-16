const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/schedule.controller");

router.get("/", scheduleController.getSchedules);
router.get("/students/:subjId/:teacherId", scheduleController.getStudentsBySubjAndTeacherID);

module.exports = router;