const path = require('path');
const dotenv = require('dotenv');
const { error, parsed: config } = dotenv.config({
        path: path.resolve(__dirname, '../.env')
});

if (error) throw error

module.exports = config;
