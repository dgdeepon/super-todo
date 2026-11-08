require('dotenv').config();
const { Sequelize } = require("sequelize");

const database = new Sequelize({
  dialect: "mysql",
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: 3306,
  logging: false,
  pool:{
    max: 2,
    min: 1,
  }
});

module.exports = database;
