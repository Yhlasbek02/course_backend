const express = require("express");
const UserController = require("../controllers/userControllers");
const controller = new UserController();
const checkUserAuth = require("../middleware/auth");
const router = express.Router();

router.post("/login", controller.login);
router.get("/profile", checkUserAuth, controller.getProfile);
router.post("/change-password", checkUserAuth, controller.changePassword);
router.post("/record-in", checkUserAuth, controller.recordIn);
router.post("/record-out", checkUserAuth, controller.recordOut);
router.get("/records", checkUserAuth, controller.getRecords);


module.exports = router;