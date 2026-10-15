const pool = require('./config/db');

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
      icon VARCHAR(50) NOT NULL,
      title VARCHAR(100) NOT NULL,
      value VARCHAR(100) NOT NULL,
      sub VARCHAR(100) NOT NULL,
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
      content JSON,
      hidden TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
  ];

  try {
    const conn = await pool.getConnection();
    console.log('✅ DB connected. Initializing tables...');
    for (const sql of queries) {
      await conn.query(sql);
    }
    conn.release();
    console.log('✅ All tables initialized successfully.');
  } catch (err) {
    console.error('❌ DB initialization failed:', err.message);
    // Don't crash the server — tables may already exist or DB may be read-only
  }
}

module.exports = initDB;
