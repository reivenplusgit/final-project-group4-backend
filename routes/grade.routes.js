const express = require("express");
const router = express.Router();
const gradeController = require("../controllers/grade.controller");

router.get("/", gradeController.getGrades);
router.get("/:id", gradeController.getGrade);
router.post("/", gradeController.createGrade);
router.put("/:id", gradeController.updateGrade);
router.delete("/:id", gradeController.deleteGrade);
router.get("/teacher/:teacherId/subject/:subjectId/students", gradeController.getStudentsByTeacherAndSubject);
router.put("/student/:student_number/subject/:subjectId", gradeController.updateStudentGrade);
module.exports = router;
