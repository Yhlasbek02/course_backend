const express = require("express");
const router = express.Router();
const userRoutes = require("./userRoutes");
const adminRoutes = require("./adminRoutes");
router.use("/user", userRoutes);
router.use("/admin", adminRoutes);
module.exports = router;