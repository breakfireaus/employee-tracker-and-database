const mysql = require('mysql2');

// path to enable access to .env variables
require('dotenv').config();

//Environment variables which connects user to the database
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) throw err;
});

module.exports = connection;