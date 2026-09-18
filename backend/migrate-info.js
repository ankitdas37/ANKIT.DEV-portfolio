const db = require('./config/db');

async function migrate() {
  try {
    console.log("Starting migration...");

    // Create table if not exists with the hidden column
    await db.query(`
      CREATE TABLE IF NOT EXISTS info_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          icon VARCHAR(50) NOT NULL,
          title VARCHAR(100) NOT NULL,
          value VARCHAR(100) NOT NULL,
          sub VARCHAR(100) NOT NULL,
          hidden TINYINT(1) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Checked info_items table existence.");

    // Check if the 'hidden' column exists (in case the user created it without it)
    const [columns] = await db.query(`SHOW COLUMNS FROM info_items LIKE 'hidden'`);
    if (columns.length === 0) {
      await db.query(`ALTER TABLE info_items ADD COLUMN hidden TINYINT(1) DEFAULT 0`);
      console.log("Added 'hidden' column to info_items.");
    }

    // Seed default data if empty
    const [rows] = await db.query(`SELECT COUNT(*) as count FROM info_items`);
    if (rows[0].count === 0) {
      await db.query(`
        INSERT INTO info_items (icon, title, value, sub)
        VALUES 
          ('🎓', 'Education', 'Diploma in', 'Computer Engineering'),
          ('💻', 'Projects', '12+', 'Completed Projects'),
          ('⭐', 'Experience', 'Fresher', 'Learning Everyday'),
          ('⚡', 'Focus', 'Full Stack', 'Web Development'),
          ('🌍', 'Location', 'India', 'Earth 🌎')
      `);
      console.log("Seeded default info items.");
    } else {
      console.log("Table already has data, skipped seeding.");
    }

    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
