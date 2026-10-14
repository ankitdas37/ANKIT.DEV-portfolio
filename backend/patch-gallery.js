const mysql = require('mysql2/promise');

async function patchGallery() {
  try {
    console.log("Connecting to Aiven MySQL...");
    const db = await mysql.createConnection({
      host: 'mysql-3e86df05-ankitdev082006-411a.k.aivencloud.com',
      port: 15588,
      user: 'avnadmin',
      password: process.env.DB_PASSWORD,
      database: 'defaultdb',
      ssl: { rejectUnauthorized: false }
    });
    console.log("Connected.");
    
    try {
      await db.query('USE portfolio_db');
    } catch (e) {
      console.log("Database portfolio_db does not exist, using defaultdb");
    }
    
    console.log("Patching gallery_folders table...");
    try {
      await db.query('ALTER TABLE gallery_folders ADD COLUMN coverImage VARCHAR(500)');
      console.log("Added column: coverImage");
    } catch (e) {
      console.log("Column coverImage might already exist:", e.message);
    }

    console.log("Done patching!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

patchGallery();
