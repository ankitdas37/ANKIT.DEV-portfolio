const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

async function run() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  // Show all tables
  const [tables] = await db.query('SHOW TABLES');
  console.log('Tables:', tables);

  // Create categories table if missing
  await db.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('categories table ensured.');

  // Insert defaults
  await db.query(`
    INSERT IGNORE INTO categories (name) VALUES
    ('Personal'), ('College'), ('Client'), ('Team'), ('Open Source')
  `);
  console.log('Default categories inserted.');

  const [cats] = await db.query('SELECT * FROM categories');
  console.log('Categories:', cats);

  db.end();
}

run().catch(console.error);
