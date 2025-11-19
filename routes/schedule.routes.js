const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/schedule.controller");

router.get("/", scheduleController.getSchedules);
router.get("/students/:subjId/:teacherId", scheduleController.getStudentsBySubjAndTeacherID);

// Get schedule for specific student (AY + Semester)
router.get("/student/:studentId", scheduleController.getScheduleByStudent);

// Create a new empty schedule for a student
router.post("/", scheduleController.createSchedule);

// Add subject entry to a schedule
router.post("/:id/add", scheduleController.addScheduleEntry);

// Update an existing schedule entry
router.patch("/:id/update", scheduleController.updateScheduleEntry);

// Assign teacher to a schedule entry
router.patch("/:id/assign", scheduleController.assignTeacher);

// Delete multiple schedule entries
router.delete("/:id/delete", scheduleController.deleteScheduleEntries);

module.exports = router;