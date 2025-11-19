const express = require("express");
const router = express.Router();
const studentController = require("../controllers/student.controller");
const { addStudent } = require("../controllers/schedule.controller");


// Routes
router.get("/", studentController.getStudents);
router.get("/:id", studentController.getStudent);
router.post("/", studentController.createStudent);
router.put("/:id", studentController.updateStudent);
router.delete("/:id", studentController.deleteStudent);

// WJG: added essential routes 
router.get("/byAccount/:accountId", studentController.getStudentByAccount);
router.post("/add", addStudent);


module.exports = router;
