const express = require("express");
const AdminAuthentification = require("../controllers/adminControllers");
const AdminAuth = new AdminAuthentification();
const checkAdminAuth = require("../middleware/adminAuth")
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const {name, surname} = req.body;
        const destination = `labels/${name}_${surname}`;
        fs.mkdirSync(destination, { recursive: true });
        cb(null, destination);
    },
    filename: function (req, file, cb) {
        cb(null, "1" + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
});



router.post('/register', AdminAuth.registerAdmin);
router.post('/login', AdminAuth.login);
router.post('/forgot-password', AdminAuth.forgotPassword);
router.post("/verify", AdminAuth.verifyCode);
router.get('/profile', checkAdminAuth, AdminAuth.getAdmin);
router.post('/change-password', checkAdminAuth, AdminAuth.changePassword);
router.delete('/delete-account', checkAdminAuth, AdminAuth.deleteAccount);
router.get("/jobs", checkAdminAuth, AdminAuth.getJobs);
router.get("/all-jobs", checkAdminAuth, AdminAuth.getAllJobs);
router.post("/job/add", checkAdminAuth, AdminAuth.addJob);
router.put("/job/edit/:id", checkAdminAuth, AdminAuth.editJob);
router.delete("/job/delete/:id", checkAdminAuth, AdminAuth.deleteJob);
router.get("/employee", checkAdminAuth, AdminAuth.getEmployee);
router.post("/employee/add", checkAdminAuth, upload.single("image"), AdminAuth.addEmployee);
router.put("/employee/edit/:id", checkAdminAuth, upload.single("image"), AdminAuth.editEmployee);
router.delete("/employee/delete/:id", checkAdminAuth, AdminAuth.deleteEmployee);
router.get("/records", checkAdminAuth, AdminAuth.getRecords);
router.get("/employee/:id", checkAdminAuth, AdminAuth.getSingleEmployee);
router.get("/get-records/:id", checkAdminAuth, AdminAuth.getUserRecords);
module.exports = router;