require('dotenv').config();
const mysql = require('mysql2/promise');

const initialLinks = [
  { type: "Email", label: "Email", value: "ankit@example.com", action: "Send Email", link: "mailto:ankit@example.com", color: "#7C3AED", glow: "rgba(124,58,237,0.3)", sort_order: 1 },
  { type: "GitHub", label: "GitHub", value: "github.com/ankitdev", action: "Visit Profile", link: "https://github.com/ankitdas", color: "#818CF8", glow: "rgba(129,140,248,0.3)", sort_order: 2 },
  { type: "LinkedIn", label: "LinkedIn", value: "linkedin.com/in/ankitdev", action: "View Profile", link: "https://linkedin.com/in/ankitdas", color: "#38BDF8", glow: "rgba(56,189,248,0.3)", sort_order: 3 },
  { type: "Instagram", label: "Instagram", value: "instagram.com/ankit.dev", action: "Follow Me", link: "https://instagram.com/ankitdas", color: "#F472B6", glow: "rgba(244,114,182,0.3)", sort_order: 4 },
  { type: "Phone", label: "Phone", value: "+91 98765 43210", action: "Call Me", link: "tel:+919876543210", color: "#34D399", glow: "rgba(52,211,153,0.3)", sort_order: 5 }
];

async function migrate() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'portfolio_db'
  });

  try {
    console.log("Creating contact_links table...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS contact_links (
          id INT AUTO_INCREMENT PRIMARY KEY,
          type VARCHAR(50) NOT NULL UNIQUE,
          label VARCHAR(50) NOT NULL,
          value VARCHAR(255) NOT NULL,
          action VARCHAR(50) NOT NULL,
          link VARCHAR(255) NOT NULL,
          color VARCHAR(50) NOT NULL,
          glow VARCHAR(50) NOT NULL,
          hidden TINYINT(1) DEFAULT 0,
          sort_order INT DEFAULT 0
      );
    `);

    console.log("Seeding initial data...");
    for (const link of initialLinks) {
      await db.query(`
        INSERT IGNORE INTO contact_links (type, label, value, action, link, color, glow, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [link.type, link.label, link.value, link.action, link.link, link.color, link.glow, link.sort_order]);
    }

    console.log("Migration complete!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await db.end();
  }
}

migrate();
