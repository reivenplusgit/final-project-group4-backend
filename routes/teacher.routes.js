const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacher.controller");

// Routes
router.get("/", teacherController.getTeachers);
router.get("/:id", teacherController.getTeacher);
router.post("/", teacherController.createTeacher);
router.put("/:id", teacherController.updateTeacher);
router.delete("/:id", teacherController.deleteTeacher);

module.exports = router;
