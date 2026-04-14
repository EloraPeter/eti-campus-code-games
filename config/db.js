const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  // db url format --> protocol://username:password@hostname:port/database_name?option=value
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('✅ New client connected to PostgreSQL');
});

module.exports = pool;