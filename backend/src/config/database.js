const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' }); // Adjust path if necessary, assuming .env is in project root

const sequelize = new Sequelize(
    process.env.DB_NAME || 'pixel_phantoms_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'password',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false, // Set to console.log to see SQL queries
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

module.exports = sequelize;
