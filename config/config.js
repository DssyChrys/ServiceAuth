const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    development: {
        username: process.env.database_user,
        password: process.env.database_password,
        database: process.env.database_name,
        host: process.env.database_host,
        dialect: 'postgres',
    },
    test: {
        username: process.env.database_user,
        password: process.env.database_password,
        database: process.env.database_name,
        host: process.env.database_host,
        dialect: 'postgres',
    },
    production: {
        username: process.env.database_user,
        password: process.env.database_password,
        database: process.env.database_name,
        host: process.env.database_host,
        dialect: 'postgres',
    },
};
