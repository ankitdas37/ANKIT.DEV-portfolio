const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Existing static skills
const skillCategories = [
  {
    id: "frontend",
    label: "Frontend",
    skills: [
      { name: "HTML5", icon: "🌐", color: "#E34F26", level: 95 },
      { name: "CSS3", icon: "🎨", color: "#1572B6", level: 90 },
      { name: "JavaScript", icon: "⚡", color: "#F7DF1E", level: 88 },
      { name: "React", icon: "⚛️", color: "#61DAFB", level: 85 },
      { name: "Tailwind CSS", icon: "💨", color: "#06B6D4", level: 90 },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    skills: [
      { name: "Node.js", icon: "🟢", color: "#339933", level: 80 },
      { name: "Express.js", icon: "🛠️", color: "#000000", level: 78 },
    ],
  },
  {
    id: "database",
    label: "Database",
    skills: [
      { name: "MongoDB", icon: "🍃", color: "#47A248", level: 75 },
      { name: "MySQL", icon: "🐬", color: "#4479A1", level: 70 },
      { name: "PostgreSQL", icon: "🐘", color: "#336791", level: 68 },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    skills: [{ name: "Git & GitHub", icon: "🔧", color: "#F05032", level: 85 }],
  },
  {
    id: "languages",
    label: "Languages",
    skills: [
      { name: "Python", icon: "🐍", color: "#3776AB", level: 72 },
      { name: "C/C++", icon: "⚙️", color: "#00599C", level: 65 },
    ],
  },
];

async function migrate() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'portfolio_db'
  });

  try {
    // 1. Create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS skills (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          icon TEXT,
          color VARCHAR(50),
          level INT DEFAULT 0,
          categories JSON,
          hidden TINYINT(1) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Clear existing (optional, but good for fresh migration)
    await pool.query('TRUNCATE TABLE skills');

    // 3. Insert skills
    console.log('Migrating skills...');
    for (const category of skillCategories) {
      for (const skill of category.skills) {
        await pool.query(
          'INSERT INTO skills (name, icon, color, level, categories) VALUES (?, ?, ?, ?, ?)',
          [skill.name, skill.icon, skill.color, skill.level, JSON.stringify([category.label])]
        );
      }
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
