const express = require("express");
const dotenv = require("dotenv");
const sequelize = require('./config/config');
const http = require("http");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Admin, User, AttendanceTime } = require("./models/models");
const routes = require("./routes/allRoutes");
dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(express.json());

const PORT = 8000 || 8080;
const dirname = path.resolve();
app.use("/", express.static(path.join(dirname, "labels")));
app.use("/api", routes);
app.all("*", (req, res, next) => {
  return res.status(404).json({ message: `Can't find ${req.originalUrl} on this server` });
});


const start = async () => {
  try {
    console.log("Authenticating database connection...");
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    console.log("Synchronizing models...");
    // await sequelize.sync({ force: true }); // This will drop tables and re-create them. Remove { force: true } in production.
    console.log("Models synchronized successfully.");

    server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (error) {
    console.error('Unable to connect to the database or synchronize models:', error);
  }
};


start();
