const jwt = require("jsonwebtoken");
const { User } = require("../models/models");

const checkUserAuth = async (req, res, next) => {
  let token
  const {authorization} = req.headers;
  if (authorization && authorization.startsWith('Bearer')) {
      try {
          token = authorization.split(' ')[1]
          const {userId} = jwt.verify(token, process.env.SECRET_KEY);
          const user = await User.findOne({
              where: { id: userId },
              attributes: { exclude: ['password'] },
          });
          if (!user) {
              res.send({message: "User not found"});
          }
          req.user = user
          next();
      } catch (error) {
          console.log(error);
          res.status(401).send({"message":"Unathorized User"});
      }
  }
  if (!token) {
      res.status(401).send({"message":"Unathorized User, No token"});
  }
}

module.exports = checkUserAuth;
