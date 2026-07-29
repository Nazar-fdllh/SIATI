const knex = require('knex');
const knexConfig = require('../knexfile');

const environment = process.env.NODE_ENV || 'development';
const db = knex(knexConfig[environment]);

async function connectDB() {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Database PostgreSQL terhubung');
    return db;
  } catch (error) {
    console.error('❌ Koneksi database gagal:', error.message);
    throw error;
  }
}

module.exports = { db, connectDB };
