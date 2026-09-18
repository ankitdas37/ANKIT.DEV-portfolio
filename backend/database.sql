CREATE DATABASE IF NOT EXISTS portfolio_db;

USE portfolio_db;

DROP TABLE IF EXISTS projects;

CREATE TABLE projects (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table for project types
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default categories
INSERT IGNORE INTO categories (name) VALUES
  ('Personal'), ('College'), ('Client'), ('Team'), ('Open Source');

-- Info Items (Quick Info Bar) table
CREATE TABLE IF NOT EXISTS info_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    icon VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    value VARCHAR(100) NOT NULL,
    sub VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default Info Items (only inserted if the table is empty to prevent duplicates on re-run)
INSERT INTO info_items (icon, title, value, sub)
SELECT * FROM (
    SELECT '🎓' as icon, 'Education' as title, 'Diploma in' as value, 'Computer Engineering' as sub
    UNION ALL SELECT '💻', 'Projects', '12+', 'Completed Projects'
    UNION ALL SELECT '⭐', 'Experience', 'Fresher', 'Learning Everyday'
    UNION ALL SELECT '⚡', 'Focus', 'Full Stack', 'Web Development'
    UNION ALL SELECT '🌍', 'Location', 'India', 'Earth 🌎'
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM info_items LIMIT 1
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon TEXT,
    color VARCHAR(50),
    level INT DEFAULT 0,
    categories JSON,
    hidden TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proposals table for Start Your Project submissions
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
);

-- Messages table for Contact Page submissions
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact Links table
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

-- About Me table
CREATE TABLE IF NOT EXISTS about_me (
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
);

-- Admin Users table for advanced authentication
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Education table
CREATE TABLE IF NOT EXISTS education (
    id INT PRIMARY KEY DEFAULT 1,
    timeline JSON,
    highlights JSON,
    subjects JSON,
    stats JSON,
    quote_text TEXT,
    quote_author VARCHAR(255)
);

