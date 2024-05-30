const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");
const { v4: uuidv4 } = require("uuid");
const Admin = sequelize.define("admin", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: () => uuidv4()
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    }
})

const User = sequelize.define("employee", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: () => uuidv4()
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    surname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phoneNumber: {
        type: DataTypes.STRING,
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

const Job = sequelize.define("job", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: () => uuidv4()
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {timestamps: true})


const AttendanceTime = sequelize.define("attendance_time", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: () => uuidv4()
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {timestamps: true})

const Codes = sequelize.define("Codes", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: () => uuidv4()
    },
    code: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    expireTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    }
});


AttendanceTime.belongsTo(User, {foreignKey: 'userId', as: "user"});
User.hasMany(AttendanceTime, {foreignKey: 'userId', as: "attendace"});

User.belongsTo(Job, {foreignKey: 'jobId', as: "job"});
Job.hasMany(User, {foreignKey: 'jobId', as: "employee"});

module.exports = {Admin, User, AttendanceTime, Codes, Job};