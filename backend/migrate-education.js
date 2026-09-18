const db = require('./config/db');

async function migrate() {
  try {
    console.log("Starting education migration...");

    await db.query(`
      CREATE TABLE IF NOT EXISTS education (
          id INT PRIMARY KEY DEFAULT 1,
          timeline JSON,
          highlights JSON,
          subjects JSON,
          stats JSON,
          quote_text TEXT,
          quote_author VARCHAR(255)
      )
    `);
    console.log("Checked education table existence.");

    const [rows] = await db.query(`SELECT COUNT(*) as count FROM education`);
    if (rows[0].count === 0) {
      
      const defaultTimeline = [
        {
          id: 1,
          year: "2024",
          title: "Started My Coding Journey",
          subtitle: "Self Learning 🌱",
          icon: "code",
          achievements: [
            "Learned basics of C, C++ 💻",
            "Solved my first programming problems 🧩",
            "Discovered passion for coding 💡"
          ],
          color: "#3B82F6"
        },
        {
          id: 2,
          year: "2025",
          title: "Web Development",
          subtitle: "Learning Phase 🚀",
          icon: "monitor",
          achievements: [
            "HTML, CSS, JavaScript 🎨",
            "Built small projects 🛠️",
            "Exploring front-end technologies ⚡"
          ],
          color: "#06B6D4"
        },
        {
          id: 3,
          year: "2026",
          title: "Diploma",
          subtitle: "Computer Engineering 🎓",
          icon: "graduation",
          achievements: [
            "Pursuing Diploma 📚",
            "Building strong fundamentals 🧱",
            "Working on real world projects 🌍"
          ],
          color: "#8B5CF6"
        },
        {
          id: 4,
          year: "Future",
          title: "Future Goals",
          subtitle: "Developer & Innovator ✨",
          icon: "rocket",
          achievements: [
            "Become a Full Stack Developer 🌟",
            "Work on impactful projects 🔥",
            "Create my own products 🏆"
          ],
          color: "#EC4899"
        }
      ];

      const defaultHighlights = {
        currentLevel: "Diploma 🎓",
        stream: "Computer Engineering 💻",
        board: "State Technical Board 🏛️",
        yearOfStudy: "2nd Year 📅",
        cgpa: "8.2 / 10 ⭐",
        graduation: "2026 🎓"
      };

      const defaultSubjects = [
        "Data Structures 🌳",
        "Web Development 🌐",
        "Database Management 🗄️",
        "OOPs Concepts 🧩",
        "Operating Systems ⚙️",
        "Computer Networks 📡"
      ];

      const defaultStats = [
        { value: "2+", label: "Years of Study", icon: "book" },
        { value: "15+", label: "Subjects Learned", icon: "code" },
        { value: "8.2", label: "CGPA (Current)", icon: "trophy" },
        { value: "5+", label: "Certifications", icon: "certificate" },
        { value: "100%", label: "Dedication", icon: "target" }
      ];

      const defaultQuoteText = "Learning is a journey that never ends.";
      const defaultQuoteAuthor = "Ankit Das";

      await db.query(
        `INSERT INTO education 
         (id, timeline, highlights, subjects, stats, quote_text, quote_author) 
         VALUES (1, ?, ?, ?, ?, ?, ?)`,
        [
          JSON.stringify(defaultTimeline),
          JSON.stringify(defaultHighlights),
          JSON.stringify(defaultSubjects),
          JSON.stringify(defaultStats),
          defaultQuoteText,
          defaultQuoteAuthor
        ]
      );
      console.log("Inserted default education data.");
    } else {
      console.log("Education data already exists. Skipping insertion.");
    }
    
    console.log("Education migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
