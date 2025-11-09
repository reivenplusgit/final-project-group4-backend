const express = require("express");
const { getSubjects, getSubject } = require('../controllers/subject.controller');

const router = express.Router();

router.get('/', getSubjects);
router.get('/:id', getSubject);

module.exports = router;