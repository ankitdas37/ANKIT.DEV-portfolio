const db = require('./config/db');

async function migrate() {
  try {
    console.log('Adding featured columns...');
    try {
      await db.query(`ALTER TABLE projects ADD COLUMN featured TINYINT(1) DEFAULT 0`);
      console.log('Added featured column.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('featured column already exists.');
      else throw e;
    }
    
    try {
      await db.query(`ALTER TABLE projects ADD COLUMN featured_order INT DEFAULT 0`);
      console.log('Added featured_order column.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('featured_order column already exists.');
      else throw e;
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
