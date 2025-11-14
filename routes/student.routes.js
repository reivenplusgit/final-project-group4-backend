const express = require("express");
const router = express.Router();
const studentController = require("../controllers/student.controller");

// Routes
router.get("/", studentController.getStudents);
router.get("/:id", studentController.getStudent);
router.post("/", studentController.createStudent);
router.put("/:id", studentController.updateStudent);
router.delete("/:id", studentController.deleteStudent);

// Special endpoint: Get student profile by account
router.get("/byAccount/:accountId", studentController.getStudentByAccount);

module.exports = router;
