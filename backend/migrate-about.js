const db = require('./config/db');

async function migrate() {
  try {
    console.log("Starting about_me migration...");

    await db.query(`
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
          cv_url VARCHAR(255)
      )
    `);
    console.log("Checked about_me table existence.");

    const [rows] = await db.query(`SELECT COUNT(*) as count FROM about_me`);
    if (rows[0].count === 0) {
      
      const defaultTerminal = [
        { icon: "UserCircle", label: "Name", value: "Ankit Das" },
        { icon: "Monitor", label: "Role", value: "Diploma Computer Engineering Student" },
        { icon: "Heart", label: "Passion", value: "Full Stack Developer" },
        { icon: "Briefcase", label: "Experience", value: "Fresher (Learning Everyday)" },
        { icon: "MapPin", label: "Location", value: "India" },
        { icon: "Code", label: "Languages", value: "C, C++, Java, JavaScript, Python" },
        { icon: "Clock", label: "Availability", value: "Open for Opportunities" },
        { icon: "Target", label: "Focus", value: "Web Development, UI/UX, 3D Web" },
        { icon: "MessageSquare", label: "Motto", value: "Code. Create. Innovate. Repeat." },
      ];

      const defaultStats = [
        { value: "12+", label: "Projects Completed", icon: "Code2" },
        { value: "1+", label: "Years of Learning", icon: "GraduationCap" },
        { value: "5+", label: "Technologies", icon: "Rocket" },
        { value: "10+", label: "Certificates", icon: "Award" },
        { value: "100%", label: "Dedication", icon: "Users" },
      ];

      const defaultLearning = [
        { name: "Three.js", progress: 80 },
        { name: "Next.js", progress: 70 },
        { name: "Node.js", progress: 65 },
        { name: "DSA", progress: 60 },
      ];

      const defaultWhatIDo = [
        "Web Development",
        "Frontend & Backend",
        "UI/UX Design",
        "Problem Solving",
        "3D Web Experiences"
      ];

      const defaultJourney = "Started my coding journey with curiosity and turning it into passion. I enjoy solving problems and building meaningful projects.";
      
      const lightbulbTitle = "I love building things that live on the internet.";
      const lightbulbSub = "Currently exploring 3D Web, Animations and Cloud Technologies.";
      
      const defaultImage = "";

      await db.query(`
        INSERT INTO about_me (
            id, terminal_data, stats_data, learning_data, what_i_do, 
            journey_text, lightbulb_title, lightbulb_subtitle, portrait_image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        1, 
        JSON.stringify(defaultTerminal), 
        JSON.stringify(defaultStats), 
        JSON.stringify(defaultLearning), 
        JSON.stringify(defaultWhatIDo),
        defaultJourney,
        lightbulbTitle,
        lightbulbSub,
        defaultImage
      ]);
      console.log("Seeded default about_me data.");
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
