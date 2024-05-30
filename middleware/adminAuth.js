const jwt = require("jsonwebtoken");
const {Admin} = require("../models/models");

const checkAdminAuth = async (req, res, next) => {
    let token
    const {authorization} = req.headers;
    if (authorization && authorization.startsWith('Bearer')) {
        try {
            token = authorization.split(' ')[1]
            const {adminId} = jwt.verify(token, process.env.SECRET_KEY);
            const admin = await Admin.findOne({
                where: { id: adminId },
                attributes: { exclude: ['password'] },
            });
            if (!admin) {
                res.send({message: "Admin not found"});
            }
            req.admin = admin
            next();
        } catch (error) {
            console.log(error);
            res.status(401).send({"message":"Unathorized admin"});
        }
    }
    if (!token) {
        res.status(401).send({"message":"Unathorized admin, No token"});
    }
}

module.exports = checkAdminAuth;