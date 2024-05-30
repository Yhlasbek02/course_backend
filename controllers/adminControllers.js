const { Admin, Codes, User, Job, AttendanceTime } = require("../models/models");
const { handleServerError, handleNotFound, fieldRequired, response } = require("../utils/utils")
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'yukleteam023@gmail.com',
        pass: 'wetlwjijdqhyfpmd',
    }
});

class AdminAuthentification {
    async registerAdmin(req, res) {
        const { username, email, password, password_conf } = req.body;
        const admin = await Admin.findOne({ where: { email: email } });
        if (admin) {
            return res.status(409).send({ message: "Admin already exists" });
        }
        if (!username || !email || !password || !password_conf) {
            return fieldRequired(res)
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email address" });
        }
        if (username.length <= 2) {
            return res.status(400).json({ message: "Name must be at least 2 characters long" });
        }
        if (password !== password_conf) {
            return res.status(400).json({ message: "Password and confirmation don't match" });
        }
        if (password.length <= 4) {
            return res.status(400).json({ message: "Password must be at least 4 characters long" });
        }
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);
        const new_admin = await Admin.create({
            username,
            email,
            password: hashPassword
        })
        const token = jwt.sign({ adminId: new_admin.id }, process.env.SECRET_KEY, { expiresIn: '1 years' });
        response(res, token, "Admin created successfully")
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return fieldRequired(res);
            }
            const admin = await Admin.findOne({ where: { username: username } });
            if (!admin) {
                return handleNotFound(res, "Admin");
            }
            const isMatch = await bcryptjs.compare(password, admin.password);
            if (isMatch && admin.username === username) {
                const token = jwt.sign({ adminId: admin.id }, process.env.SECRET_KEY, { expiresIn: '1 years' });
                response(res, token, "Admin login successfull")
            } else {
                handleNotFound(res, "Password");
            }
        } catch (error) {
            console.log(error);
            handleServerError(res, error);
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return fieldRequired(res)
            }
            const admin = await Admin.findOne({ where: { email: email } });
            if (!admin) {
                return handleNotFound(res, "Email")
            }
            const randomNumber = Math.floor(Math.random() * 9000) + 1000;
            console.log(randomNumber);
            const expireTime = new Date(Date.now() + 5 * 60 * 1000);
            await Codes.create({
                code: randomNumber,
                email: email,
                expireTime: expireTime
            });
            var mailOptions = {
                require: "yukleteam023@gmail.com",
                to: email,
                subject: "Secret Key",
                html: "<h3>Verification code is </h3>" + "<h1>" + randomNumber + "</h1>" + "<h3>Verification code expires in 5 minutes</h3>"
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.error(error);
                }
                if (!info.messageId) {
                    return console.error("Message ID is undefined. Email may not have been sent.");
                }
                console.log('====================================');
                console.log('Message sent: %s', info.messageId);
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            });
            response(res, null, "Please verify your number")
        } catch (error) {

            handleServerError(res, error)
        }
    }

    async verifyCode(req, res) {
        try {
            const { otp } = req.body;
            const code = await Codes.findOne({ where: { code: otp } });
            if (!code) {
                return handleNotFound(res, "Code")
            }
            const expireTime = code.expireTime;
            const now = new Date(Date.now());
            if (expireTime <= now) {
                return res.status(401).json({ status: false, message: "Verification code has expired! Please resend it again." });
            }

            const admin = await Admin.findOne({
                where: {
                    email: code.email
                }
            })
            
            const token = jwt.sign({ adminId: admin.id }, process.env.SECRET_KEY, { expiresIn: '1 year' });
            const data = {token: token}
            await code.destroy();
            response(res, data, "Verification is true")
        } catch (error) {

            handleServerError(res, error)
        }
    }

    async getAdmin(req, res) {
        try {
            const id = req.admin.id;
            const admin = await Admin.findOne({
                where: { id: id },
                attributes: { exclude: ['password'] },
            });
            if (!admin) {
                return handleNotFound(res, "Admin")
            }
            response(res, admin, "Success");
        } catch (error) {
            handleServerError(res, error)
        }
    }

    async changePassword(req, res) {
        const { password, password_conf } = req.body;
        try {
            if (password !== password_conf) {
                return res.status(400).json({ status: false, message: "Password and confirmation not match" });
            }
            if (password.length < 4) {
                return res.status(400).json({ status: false, message: "Password must be at least 4 characters long" });
            }
            const id = req.admin.id;
            const admin = await Admin.findOne({ where: { id } });
            if (!admin) {
                return handleNotFound(res, "Admin")
            }
            const salt = await bcryptjs.genSalt(10);
            const hashPassword = await bcryptjs.hash(password, salt);
            admin.password = hashPassword;
            await admin.save();
            res.status(200).json({ status: true, message: "Password successfully edited" });
            response(res, data = null, "Password successfully edited")
        } catch (error) {
            handleServerError(res, error)
        }
    }

    async deleteAccount(req, res) {
        try {
            const { id } = req.admin.id;
            const admin = await Admin.findOne({ where: { uuid: id } });
            if (!admin) {
                return handleNotFound(res, "Admin")
            }
            await admin.destroy();
            res.status(200).json({ message: "Account successfully deleted" });
            response(res, data = null, "Account successfully deleted")
        } catch (error) {
            handleServerError(res, error)
        }
    }


    async getJobs(req, res) {
        try {
            const page = req.query.page || 1;
            const limit = req.query.limit || 10;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const sort = req.query.sort || 'createdAt';
            const sortOrder = req.query.order || 'DESC';
            const {count: totalJobs, rows: jobs} = await Job.findAndCountAll({
                offset,
                limit: parseInt(limit),
                order: [[sort, sortOrder]],
            });
            if (jobs.length === 0) {
                return handleNotFound(res, "Jobs")
            }
            const data = {
                jobs, page, totalJobs, totalPage: Math.ceil(totalJobs/limit)
            }
            response(res, data, "Success")
        } catch (error) {
            handleServerError(res, error)
        }
    }

    async getAllJobs (req, res) {
        try {
            let jobs = await Job.findAll();
            if (jobs.length === 0) {
                return jobs = []
            }
            response(res, jobs, "Success");
        } catch (error) {
            handleServerError(res, error);
        }
    }

    async addJob(req, res) {
        try {
            const { job } = req.body;
            console.log(req.body)
            if (!job) {
                return fieldRequired(res);
            }
            const newJob = await Job.create({
                name: job
            })
            response(res, newJob, "Jobs created successfully");
        } catch (error) {
            handleServerError(res, error)
        }
    }

    async editJob(req, res) {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const job = await Job.findOne({ where: { uuid: id } });
            if (!job) {
                return handleNotFound(res, "Job");
            }
            job.name = name;
            await job.save();
            response(res, job, "Job edited successfully");
        } catch (error) {
            handleServerError(res, error)
        }
    }

    async deleteJob(req, res) {
        try {
            const { id } = req.params;
            const job = await Job.findOne({ where: { uuid: id } });
            if (!job) {
                return handleNotFound(res, "Job");
            }
            await job.destroy();
            response(res, data = null, "Job deleted successfully");
        } catch (error) {
            handleServerError(res, error)
        }
    }

    async addEmployee(req, res) {
        try {
            const { name, surname, phoneNumber, jobId } = req.body;
            if (!name || !surname || !phoneNumber) {
                return fieldRequired(res);
            }
            const job = await Job.findOne({ where: { id: jobId } });
            if (!job) {
                return handleNotFound(res, 'Job');
            }
            const password = "12345"
            const salt = await bcryptjs.genSalt(10);
            const hashPassword = await bcryptjs.hash(password, salt);
            const imageUrl = req.file ? `/${name}_${surname}/${req.file.filename}` : null
            const newEmployee = await User.create({
                name, surname, phoneNumber, imageUrl, password: hashPassword, jobId: jobId
            });
            response(res, newEmployee, "Employee added successully");
        } catch (error) {
            handleServerError(res, error)
        }
    }

    async getEmployee(req, res) {
        try {
            const page = req.query.page || 1;
            const limit = req.query.limit || 10;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const sort = req.query.sort || 'createdAt';
            const sortOrder = req.query.order || 'DESC';
            const searchQuery = req.query.search || '';

            const searchCondition = searchQuery
                ? {
                    [Op.or]: [
                        { name: { [Op.like]: `%${searchQuery}%` } },
                        { surname: { [Op.like]: `%${searchQuery}%` } },
                    ],
                }
                : {};

            const {count: totalEmployee, rows: employees} = await User.findAndCountAll({
                where: searchCondition,
                offset,
                limit: parseInt(limit),
                order: [[sort, sortOrder]],
                attributes: { exclude: ['password'] },
                include: [
                    {
                        model: Job,
                        as: 'job',
                    },
                ],
            });

            if (employees.length === 0) {
                return handleNotFound(res, 'Employee');
            }
            const data = {
                totalEmployee,
                employees,
                page,
                totalPage: Math.ceil(totalEmployee / limit)
            }
            response(res, data, 'Success');
        } catch (error) {
            handleServerError(res, error);
        }
    }


    async editEmployee(req, res) {
        try {
            const { id } = req.params;
            const { name, surname, phoneNumber, jobId } = req.body;

            if (!name || !surname || !phoneNumber) {
                return fieldRequired(res);
            }

            const employee = await User.findOne({ where: { uuid: id } });
            if (!employee) {
                return handleNotFound(res, 'Employee');
            }

            const job = await Job.findOne({ where: { id: jobId } });
            if (!job) {
                return handleNotFound(res, 'Job');
            }

            const imageUrl = req.file ? `/labels/${name}_${surname}/${req.file.filename}` : employee.imageUrl;
            employee.name = name;
            employee.surname = surname;
            employee.phoneNumber = phoneNumber;
            employee.imageUrl = imageUrl;
            employee.jobId = jobId;

            await employee.save();

            response(res, employee, "Employee updated successfully");
        } catch (error) {
            handleServerError(res, error);
        }
    }

    async deleteEmployee(req, res) {
        try {
            const { id } = req.params;
            const employee = await User.findOne({ where: { uuid: id } });
            if (!employee) {
                return handleNotFound(res, 'Employee');
            }
            await employee.destroy();
            response(res, null, "Employee deleted successfully");
        } catch (error) {
            handleServerError(res, error);
        }
    }

    async getRecords(req, res) {
        try {
            const { type, page = 1, limit = 10, sort = 'createdAt', order = 'DESC' } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(pageSize);
            const where = {}
            if (type) {
                where.type = type;
            }
            const { count: totalRecords, rows: records } = await AttendanceTime.findAll({
                where: where,
                order: [[sort, order]],
                limit: parseInt(limit),
                offset
            })
            const data = {
                totalRecords,
                records,
                page,
                totalPage: Math.ceil(totalRecords / limit)
            }
            response(res, data, "Success")
        } catch (error) {
            handleServerError(res, error)
        }
    }


    async getSingleEmployee(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findOne({
                where: { uuid: id },
            });

            if (!user) {
                return handleNotFound(res, "User");
            }

            response(res, user, "Success");

        } catch (error) {
            handleServerError(res, error);
        }
    }

    async getUserRecords(req, res) {
        try {
            const { id } = req.params;
            const { type, page = 1, limit = 10, sort = 'createdAt', order = 'DESC' } = req.query;
            const user = await User.findOne({
                where: { uuid: id },
            });

            if (!user) {
                return handleNotFound(res, "User");
            }
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const where = {
                userId: user.id
            }
            if (type) {
                where.type = type;
            }
            const { count: totalRecords, rows: records } = await AttendanceTime.findAndCountAll({
                where: where,
                order: [[sort, order]],
                limit: parseInt(limit),
                offset
            })
            const data = {
                totalRecords,
                records,
                page,
                totalPage: Math.ceil(totalRecords / limit)
            }
            response(res, data, "Success");
        } catch (error) {
            handleServerError(res, error);
        }
    }

}

module.exports = AdminAuthentification;