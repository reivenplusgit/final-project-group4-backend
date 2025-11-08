const express = require("express");
const { getAdmins, getAdmin } = require("../controllers/admin.controller");

const router = express.Router();

router.get("/", getAdmins);
router.get("/:id", getAdmin);

module.exports = router;
