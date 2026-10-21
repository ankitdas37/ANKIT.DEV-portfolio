const pool = require('./config/db');
const bcrypt = require('bcrypt');

async function initDB() {
  const queries = [
    // Projects
    `CREATE TABLE IF NOT EXISTS projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      color VARCHAR(50),
      projectType VARCHAR(100),
      tech TEXT,
      github VARCHAR(500),
      demo VARCHAR(500),
      youtubeUrl VARCHAR(500),
      docsUrl VARCHAR(500),
      startDate VARCHAR(100),
      duration VARCHAR(100),
      image VARCHAR(500),
      logo VARCHAR(500),
      architecture TEXT,
      screenshots JSON,
      notes JSON,
      team JSON,
      hidden TINYINT(1) DEFAULT 0,
      featured TINYINT(1) DEFAULT 0,
      featured_order INT DEFAULT 0,
      project_order INT DEFAULT 0,
      status VARCHAR(100),
      version VARCHAR(50),
      extraInfo JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Categories
    `CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Info Items
    `CREATE TABLE IF NOT EXISTS info_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      icon VARCHAR(50) DEFAULT '',
      title VARCHAR(255) NOT NULL,
      value VARCHAR(255) NOT NULL,
      sub VARCHAR(255) DEFAULT '',
      hidden TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Skills
    `CREATE TABLE IF NOT EXISTS skills (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      icon TEXT,
      color VARCHAR(50),
      level INT DEFAULT 0,
      categories JSON,
      hidden TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Proposals
    `CREATE TABLE IF NOT EXISTS proposals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      address TEXT,
      project_title VARCHAR(255) NOT NULL,
      project_details TEXT NOT NULL,
      file_path VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Messages
    `CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Contact Links
    `CREATE TABLE IF NOT EXISTS contact_links (
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
    )`,

    // About Me
    `CREATE TABLE IF NOT EXISTS about_me (
      id INT PRIMARY KEY DEFAULT 1,
      terminal_data JSON,
      stats_data JSON,
      learning_data JSON,
      what_i_do JSON,
      journey_text TEXT,
      lightbulb_title VARCHAR(255),
      lightbulb_subtitle VARCHAR(255),
      portrait_image VARCHAR(255),
      journey_title VARCHAR(255) DEFAULT 'My Journey',
      what_i_do_title VARCHAR(255) DEFAULT 'What I Do',
      cv_url VARCHAR(255)
    )`,

    // Admin Users
    `CREATE TABLE IF NOT EXISTS admin_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Education
    `CREATE TABLE IF NOT EXISTS education (
      id INT PRIMARY KEY DEFAULT 1,
      timeline JSON,
      highlights JSON,
      subjects JSON,
      stats JSON,
      quote_text TEXT,
      quote_author VARCHAR(255)
    )`,

    // Certificates
    `CREATE TABLE IF NOT EXISTS certificates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      organization VARCHAR(255),
      date VARCHAR(100),
      color VARCHAR(50),
      category VARCHAR(100),
      link VARCHAR(500),
      image VARCHAR(500),
      hidden TINYINT(1) DEFAULT 0,
      hours INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Gallery Folders
    `CREATE TABLE IF NOT EXISTS gallery_folders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      color VARCHAR(50),
      hidden TINYINT(1) DEFAULT 0,
      coverImage VARCHAR(500),
      images JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Testimonials
    `CREATE TABLE IF NOT EXISTS testimonials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      quote TEXT NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(255),
      avatar VARCHAR(255),
      avatarColor VARCHAR(100),
      stars INT DEFAULT 5,
      platform VARCHAR(100),
      relation VARCHAR(100),
      date VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Blog Posts
    `CREATE TABLE IF NOT EXISTS blog_posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      excerpt TEXT,
      tag VARCHAR(100),
      tagColor VARCHAR(50),
      readTime VARCHAR(50),
      date VARCHAR(100),
      emoji VARCHAR(50),
      slug VARCHAR(255),
      image VARCHAR(500) DEFAULT '',
      showOnHome TINYINT(1) DEFAULT 0,
      homeOrder INT DEFAULT 0,
      content LONGTEXT,
      hidden TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Team Profiles
    `CREATE TABLE IF NOT EXISTS team_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(255) DEFAULT '',
      email VARCHAR(255) DEFAULT '',
      photo VARCHAR(500) DEFAULT '',
      github VARCHAR(500) DEFAULT '',
      linkedin VARCHAR(500) DEFAULT '',
      instagram VARCHAR(500) DEFAULT '',
      twitter VARCHAR(500) DEFAULT '',
      website VARCHAR(500) DEFAULT '',
      bio TEXT,
      skills VARCHAR(500) DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
  ];

  try {
    const conn = await pool.getConnection();
    console.log('✅ DB connected. Initializing tables...');
    for (const sql of queries) {
      try {
        await conn.query(sql);
      } catch (qErr) {
        console.warn('⚠️ Table creation warning:', qErr.message);
      }
    }

    // ─── Auto-Migrations for existing tables ─────────────────
    // 1. Ensure info_items has 'hidden' column
    try {
      const [infoCols] = await conn.query("SHOW COLUMNS FROM info_items LIKE 'hidden'");
      if (infoCols.length === 0) {
        await conn.query("ALTER TABLE info_items ADD COLUMN hidden TINYINT(1) DEFAULT 0");
        console.log("✅ Added 'hidden' column to info_items");
      }
    } catch (e) {
      console.warn("⚠️ info_items hidden check:", e.message);
    }

    // 2. Ensure projects has 'featured' and 'featured_order'
    try {
      const [featCols] = await conn.query("SHOW COLUMNS FROM projects LIKE 'featured'");
      if (featCols.length === 0) {
        await conn.query("ALTER TABLE projects ADD COLUMN featured TINYINT(1) DEFAULT 0");
      }
      const [orderCols] = await conn.query("SHOW COLUMNS FROM projects LIKE 'featured_order'");
      if (orderCols.length === 0) {
        await conn.query("ALTER TABLE projects ADD COLUMN featured_order INT DEFAULT 0");
      }
    } catch (e) {
      console.warn("⚠️ projects featured cols check:", e.message);
    }

    // 3. Ensure blog_posts has image, showOnHome, homeOrder, hidden, content
    try {
      const [blogCols] = await conn.query("SHOW COLUMNS FROM blog_posts");
      const names = blogCols.map(c => c.Field);
      if (!names.includes('image')) {
        await conn.query("ALTER TABLE blog_posts ADD COLUMN image VARCHAR(500) DEFAULT ''");
      }
      if (!names.includes('showOnHome')) {
        await conn.query("ALTER TABLE blog_posts ADD COLUMN showOnHome TINYINT(1) DEFAULT 0");
      }
      if (!names.includes('homeOrder')) {
        await conn.query("ALTER TABLE blog_posts ADD COLUMN homeOrder INT DEFAULT 0");
      }
      if (!names.includes('hidden')) {
        await conn.query("ALTER TABLE blog_posts ADD COLUMN hidden TINYINT(1) DEFAULT 0");
      }
      if (!names.includes('content')) {
        await conn.query("ALTER TABLE blog_posts ADD COLUMN content LONGTEXT");
      }
    } catch (e) {
      console.warn("⚠️ blog_posts column check:", e.message);
    }

    // ─── Default Seeding if empty ────────────────────────────
    // Seed default info items if none exist
    try {
      const [infoRows] = await conn.query("SELECT COUNT(*) as count FROM info_items");
      if (infoRows[0].count === 0) {
        await conn.query(`
          INSERT INTO info_items (icon, title, value, sub, hidden) VALUES
            ('🎓', 'Education', 'Diploma in', 'Computer Engineering', 0),
            ('💻', 'Projects', '12+', 'Completed Projects', 0),
            ('⭐', 'Experience', 'Fresher', 'Learning Everyday', 0),
            ('⚡', 'Focus', 'Full Stack', 'Web Development', 0),
            ('🌍', 'Location', 'India', 'Earth 🌎', 0)
        `);
        console.log("✅ Seeded default info_items.");
      }
    } catch (e) {
      console.warn("⚠️ info_items seed check:", e.message);
    }

    // Seed default categories if none exist
    try {
      const [catRows] = await conn.query("SELECT COUNT(*) as count FROM categories");
      if (catRows[0].count === 0) {
        await conn.query(`
          INSERT IGNORE INTO categories (name) VALUES
            ('Personal'), ('College'), ('Client'), ('Team'), ('Open Source')
        `);
        console.log("✅ Seeded default categories.");
      }
    } catch (e) {
      console.warn("⚠️ categories seed check:", e.message);
    }

    // Seed default team profile if none exists
    try {
      const [teamRows] = await conn.query("SELECT COUNT(*) as count FROM team_profiles");
      if (teamRows[0].count === 0) {
        await conn.query(`
          INSERT INTO team_profiles 
            (name, role, email, photo, github, linkedin, instagram, website, bio, skills)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          'Ankit Das',
          'Lead Full Stack Developer',
          'ankitdas082006@gmail.com',
          'https://res.cloudinary.com/gfd8dnch/image/upload/v1792094606/ufsjtup6pratlr8de3zt.jpg',
          'https://github.com/ankitdas37',
          'https://linkedin.com/in/ankitdas',
          'https://www.instagram.com/the.ankit.das?stkn=Z3l6MzRiZDR3czF1',
          'https://ankit-dev-portfolio.vercel.app',
          'Full Stack Developer passionate about crafting modern, interactive web applications and scalable solutions.',
          'React, Node.js, Next.js, MySQL, Tailwind CSS'
        ]);
        console.log("✅ Seeded default team profile for Ankit Das.");
      }
    } catch (e) {
      console.warn("⚠️ team_profiles seed check:", e.message);
    }

    // Seed default admin if none exists
    const [admins] = await conn.query('SELECT id FROM admin_users LIMIT 1');
    if (admins.length === 0) {
      const email = process.env.ADMIN_EMAIL || 'ankitdas082006@gmail.com';
      const password = process.env.ADMIN_PASSWORD || 'ankit@admin2006';
      const hash = await bcrypt.hash(password, 10);
      await conn.query('INSERT INTO admin_users (email, password_hash) VALUES (?, ?)', [email, hash]);
      console.log(`✅ Default admin created: ${email}`);
    } else {
      // Auto-correct: if admin was seeded with the old placeholder email, update it
      const targetEmail = process.env.ADMIN_EMAIL || 'ankitdas082006@gmail.com';
      const [old] = await conn.query("SELECT id FROM admin_users WHERE email = 'admin@ankit.dev' LIMIT 1");
      if (old.length > 0) {
        await conn.query('UPDATE admin_users SET email = ? WHERE email = ?', [targetEmail, 'admin@ankit.dev']);
        console.log(`✅ Admin email updated to: ${targetEmail}`);
      }
    }

    conn.release();
    console.log('✅ All tables initialized successfully.');
  } catch (err) {
    console.error('❌ DB initialization failed:', err.message);
    // Don't crash the server — tables may already exist or DB may be read-only
  }
}

module.exports = initDB;
