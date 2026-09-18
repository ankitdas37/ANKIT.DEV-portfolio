const db = require('./config/db');

async function migrate() {
  try {
    console.log("Starting proposals migration...");

    await db.query(`
      CREATE TABLE IF NOT EXISTS proposals (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          address TEXT,
          project_title VARCHAR(255) NOT NULL,
          project_details TEXT NOT NULL,
          file_path VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Created proposals table.");

    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
