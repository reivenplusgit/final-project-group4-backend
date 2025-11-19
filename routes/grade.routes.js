const express = require("express");
const router = express.Router();
const gradeController = require("../controllers/grade.controller");

// MUST COME FIRST
router.put(
  "/student/:studentRef/subject/:subjectId",
  gradeController.updateStudentGrade
);

// THEN OTHER SPECIFIC ROUTES
router.get(
  "/teacher/:teacherId/subject/:subjectId/students",
  gradeController.getStudentsByTeacherAndSubject
);

// THEN CRUD (PUT /:id MUST ALWAYS BE LAST)
router.get("/", gradeController.getGrades);
router.get("/:id", gradeController.getGrade);
router.post("/", gradeController.createGrade);
router.put("/:id", gradeController.updateGrade);  // <-- This must ALWAYS come last
router.delete("/:id", gradeController.deleteGrade);

module.exports = router;
