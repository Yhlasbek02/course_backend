const { User, AttendanceTime, Job } = require("../models/models");
const { handleServerError, handleNotFound, fieldRequired, response } = require("../utils/utils")
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

class UserController {
    async login(req, res) {
        try {
            const { phoneNumber, password } = req.body;
            if (!phoneNumber || !password) {
                return fieldRequired(res);
            }
            const user = await User.findOne({ where: { phoneNumber: phoneNumber } });
            if (!user) {
                return handleNotFound(res, "User");
            }
            const isMatch = await bcryptjs.compare(password, user.password);
            if (isMatch && user.phoneNumber === phoneNumber) {
                const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, { expiresIn: '1 years' });
                response(res, token, "User login successfull")
            } else {
                handleNotFound(res, "Password");
            }
        } catch (error) {
            console.log(error);
            handleServerError(res, error);
        }
    }

    async getProfile(req, res) {
        try {
            const id = req.user.id;
            const user = await User.findOne({
                where: { id: id },
                attributes: { exclude: ['password'] },
            });
            if (!user) {
                return handleNotFound(res, "User")
            }
            response(res, user, "Success");
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
            const id = req.user.id;
            const user = await User.findOne({ where: { id } });
            if (!user) {
                return handleNotFound(res, "User")
            }
            const salt = await bcryptjs.genSalt(10);
            const hashPassword = await bcryptjs.hash(password, salt);
            user.password = hashPassword;
            await user.save();
            response(res, null, "Password successfully edited")
        } catch (error) {
            handleServerError(res, error)
        }
    }

    async recordIn(req, res) {
        try {
            const userId = req.user.id;
            const income = await AttendanceTime.create({
                type: "IN",
                userId: userId
            });
            response(res, income, "Income recorded");
        } catch (error) {
            handleServerError(res, error);
        }
    }

    async recordOut(req, res) {
        try {
            const userId = req.user.id;
            const outcome = await AttendanceTime.create({
                type: "OUT",
                userId: userId
            })
            response(res, outcome, "Outcome recorded");
        } catch (error) {
            handleServerError(res, error);
        }
    }

    async getRecords(req, res) {
        try {
            const { type, page = 1, limit = 10, sort = 'createdAt', order = 'DESC' } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const where = {
                userId: req.user.id
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

module.exports = UserController;