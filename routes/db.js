const pgp = require('pg-promise')();
const dotenv = require('dotenv');
dotenv.config();

const cn = {
  host: process.env.DB_HOST,
  port: 5432,
  database: 'sigdb_5tox',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  },
};
const db = pgp(cn);
module.exports = db;
