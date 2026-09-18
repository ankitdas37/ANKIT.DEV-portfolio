const db = require('./config/db');

async function migrate() {
  try {
    console.log('Adding project_order column...');
    try {
      await db.query(`ALTER TABLE projects ADD COLUMN project_order INT DEFAULT 0`);
      console.log('Added project_order column.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('project_order column already exists.');
      else throw e;
    }

    // Initialize project_order to match current order (oldest to newest or whatever)
    // We can just set them based on ID for a stable default
    const [projects] = await db.query('SELECT id FROM projects ORDER BY created_at DESC');
    for (let i = 0; i < projects.length; i++) {
        await db.query('UPDATE projects SET project_order = ? WHERE id = ?', [i + 1, projects[i].id]);
    }
    console.log('Initialized project_order values.');

    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
