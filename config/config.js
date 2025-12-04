require('dotenv').config();

module.exports = {
  development: {
    username: 'root',
    password: process.env.DB_PASSWORD,
    database: 'balance_db',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
  production: {
    username: 'root',
    password: process.env.DB_PASSWORD,
    database: 'balance_db',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    logging: false,
  },
};