require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'portfolio_db'
  });

  try {
    console.log('Migrating admin users...');

    // Ensure the table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if any admin exists
    const [rows] = await connection.query('SELECT * FROM admin_users');
    
    if (rows.length === 0) {
      console.log('No admin found, creating default admin from .env');
      const email = process.env.ADMIN_EMAIL || 'admin@ankit.dev';
      const password = process.env.ADMIN_PASSWORD || 'ankit@admin';
      
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      
      await connection.query('INSERT INTO admin_users (email, password_hash) VALUES (?, ?)', [email, hash]);
      console.log(`Default admin created: ${email}`);
    } else {
      console.log('Admin user already exists.');
    }
    
    console.log('Admin migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrate();
