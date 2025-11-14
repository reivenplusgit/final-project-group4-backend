const express = require("express");
const { getSubjects, getSubject, createSubject, editSubject, deleteSubject } = require('../controllers/subject.controller');

const router = express.Router();

router.get('/', getSubjects);
router.get('/:id', getSubject);
router.post('/', createSubject);
router.put('/:id', editSubject);
router.delete('/', deleteSubject);


module.exports = router;