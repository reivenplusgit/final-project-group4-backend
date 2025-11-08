const express = require("express");
const { getTeachers, getTeacher } = require("../controllers/teacher.controller");

const router = express.Router();

router.get("/", getTeachers);
router.get("/:id", getTeacher);

module.exports = router;
