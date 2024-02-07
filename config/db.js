const Sequelize = require("sequelize");

// hard coded the DB credentials, ideally these should be loaded from env vars
const sequelize = new Sequelize("mcdb", "admin", "Atlanta321", {
    host: "mcdb-instance.cbtfqok0pfsy.us-east-1.rds.amazonaws.com",
    port: 3306,
    dialect: "mysql",
    dialectOptions: {
        ssl: 'Amazon RDS'
    },
});

module.exports = sequelize