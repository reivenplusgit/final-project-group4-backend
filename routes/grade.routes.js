const express = require("express");
const router = express.Router();
const gradeController = require("../controllers/grade.controller");

// Routes
router.get("/", gradeController.getGrades);
router.get("/:id", gradeController.getGrade);
router.post("/", gradeController.createGrade);
router.put("/:id", gradeController.updateGrade);
router.delete("/:id", gradeController.deleteGrade);

module.exports = router;
