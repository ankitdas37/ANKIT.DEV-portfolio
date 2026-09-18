// Projects data
export const projects = [
  {
    id: 1,
    title: "CEREBRO — AI Second Brain",
    description:
      "AI-powered personal knowledge management and second brain platform with intelligent search, knowledge graph visualization, and AI chat assistant.",
    image: "/src/assets/project-cerebro.jpg",
    tech: ["MERN", "AI/ML", "PostgreSQL", "OpenAI"],
    github: "https://github.com/ankitdas",
    demo: "https://cerebro.demo.dev",
    featured: true,
    color: "#7C3AED",
  },
  {
    id: 2,
    title: "Money Mitra Banking System",
    description:
      "A modern simulated banking platform for secure account management, transaction history, fund transfers, and financial analytics.",
    image: "/src/assets/project-moneymitra.jpg",
    tech: ["MERN", "Tailwind CSS", "PostgreSQL", "JWT"],
    github: "https://github.com/ankitdas",
    demo: "https://moneymitra.demo.dev",
    featured: true,
    color: "#10B981",
  },
  {
    id: 3,
    title: "Active Knowledge Library",
    description:
      "A modern digital knowledge and document management platform with categorization, search, tagging, and collaborative document viewing.",
    image: "/src/assets/project-knowledge.jpg",
    tech: ["React", "Node.js", "MongoDB", "Express"],
    github: "https://github.com/ankitdas",
    demo: "https://knowledge.demo.dev",
    featured: true,
    color: "#00BFFF",
  },
  {
    id: 4,
    title: "Personal Portfolio Website",
    description:
      "This premium personal developer portfolio built with React, featuring glassmorphism design, Framer Motion animations, and a futuristic aesthetic.",
    image: "/src/assets/project-portfolio.jpg",
    tech: ["React", "TypeScript", "Tailwind CSS", "Framer Motion"],
    github: "https://github.com/ankitdas",
    demo: "https://ankit.dev",
    featured: true,
    color: "#2563EB",
  },
];

// Skills data
export const skillCategories = [
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

export const allSkills = skillCategories.flatMap((cat) => cat.skills);

// Experience data removed

// Certificates data
export const certificates = [
  {
    id: 1,
    title: "Google Foundations of Cybersecurity",
    organization: "Google",
    date: "2024",
    color: "#2563EB",
    category: "Programming",
    link: "https://www.coursera.org",
  },
  {
    id: 2,
    title: "Responsive Web Design Certificate",
    organization: "freeCodeCamp",
    date: "2024",
    color: "#10B981",
    category: "Web Development",
    link: "https://www.freecodecamp.org",
  },
  {
    id: 3,
    title: "Problem Solving (Basic)",
    organization: "HackerRank",
    date: "2024",
    color: "#00BFFF",
    category: "Programming",
    link: "https://www.hackerrank.com",
  },
  {
    id: 4,
    title: "Java Programming Complete Course",
    organization: "Great Learning",
    date: "2024",
    color: "#A855F7",
    category: "Programming",
    link: "https://www.mygreatlearning.com",
  },
  {
    id: 5,
    title: "Programming for Everybody (Getting Started with Python)",
    organization: "Coursera",
    date: "2023",
    color: "#F59E0B",
    category: "Programming",
    link: "https://www.coursera.org",
  },
  {
    id: 6,
    title: "The Complete Web Development Bootcamp",
    organization: "Udemy",
    date: "2023",
    color: "#EC4899",
    category: "Web Development",
    link: "https://www.udemy.com",
  },
  {
    id: 7,
    title: "Introduction to Python",
    organization: "Infosys Springboard",
    date: "2023",
    color: "#8B5CF6",
    category: "Programming",
    link: "https://infyspringboard.onwingspan.com",
  },
  {
    id: 8,
    title: "SQL Fundamentals Course Certificate",
    organization: "Sololearn",
    date: "2023",
    color: "#6366F1",
    category: "Database",
    link: "https://www.sololearn.com",
  },
];

export const certificateStats = [
  { value: "12+", label: "Certificates", icon: "Award" },
  { value: "5+", label: "Platforms", icon: "Calendar" },
  { value: "200+", label: "Hours Learned", icon: "Clock" },
  { value: "100%", label: "Dedication", icon: "Star" },
];

export const learnedSkills = [
  { name: "Web Development", percentage: 95 },
  { name: "Programming", percentage: 90 },
  { name: "Database", percentage: 80 },
  { name: "Tools & Platforms", percentage: 85 },
  { name: "Problem Solving", percentage: 92 },
];

// Testimonials
export const testimonials = [
  {
    id: 1,
    quote:
      "Ankit is a dedicated developer who always delivers high quality work on time. His attention to detail and creativity is truly exceptional — one of the best I've worked with.",
    name: "Project Client",
    role: "Business Owner",
    avatar: "PC",
    avatarColor: "from-[#2563EB] to-[#7C3AED]",
    stars: 5,
    platform: "Direct",
    relation: "Client",
    date: "Aug 2025",
  },
  {
    id: 2,
    quote:
      "Great problem solver and very cooperative in teamwork. His ability to understand complex requirements and implement them quickly is impressive. Would love to collaborate again!",
    name: "Rahul Sharma",
    role: "Peer Developer",
    avatar: "RS",
    avatarColor: "from-[#10B981] to-[#2563EB]",
    stars: 5,
    platform: "LinkedIn",
    relation: "College Peer",
    date: "Jun 2025",
  },
  {
    id: 3,
    quote:
      "His projects are clean, efficient and user-friendly. Ankit's code quality and passion for learning new technologies truly sets him apart from other students I have mentored.",
    name: "Prof. Mehta",
    role: "Mentor & Faculty",
    avatar: "PM",
    avatarColor: "from-[#EC4899] to-[#8B5CF6]",
    stars: 5,
    platform: "College",
    relation: "Mentor",
    date: "May 2025",
  },
];

// Stats
export const stats = [
  { value: 12, suffix: "+", label: "Projects Completed", icon: "🚀" },
  { value: 2, suffix: "+", label: "Years Learning", icon: "📅" },
  { value: 10, suffix: "+", label: "Technologies", icon: "⚡" },
  { value: 100, suffix: "%", label: "Commitment", icon: "🎯" },
];

// Quick info bar
export const infoItems = [
  {
    icon: "🎓",
    title: "Education",
    value: "Diploma in",
    sub: "Computer Engineering",
  },
  { icon: "💻", title: "Projects", value: "12+", sub: "Completed Projects" },
  {
    icon: "⭐",
    title: "Experience",
    value: "Fresher",
    sub: "Learning Everyday",
  },
  { icon: "⚡", title: "Focus", value: "Full Stack", sub: "Web Development" },
  { icon: "🌍", title: "Location", value: "India", sub: "Earth 🌎" },
];

// Achievements Gallery Data
export const achievementsGallery = [
  {
    id: 1,
    title: "Competitions & Awards",
    color: "#2563EB",
    hidden: false,
    images: [
      {
        id: 101,
        title: "Hackathon Winner",
        image: "/src/assets/project-cerebro.jpg",
        hidden: false,
      },
      {
        id: 102,
        title: "Best Project Award",
        image: "/src/assets/project-moneymitra.jpg",
        hidden: false,
      },
    ],
  },
  {
    id: 2,
    title: "Certifications & Events",
    color: "#8B5CF6",
    hidden: false,
    images: [
      {
        id: 201,
        title: "Coding Bootcamp",
        image: "/src/assets/project-knowledge.jpg",
        hidden: false,
      },
      {
        id: 202,
        title: "Tech Fest 2024",
        image: "/src/assets/project-portfolio.jpg",
        hidden: false,
      },
    ],
  },
];

// Education Section Data
export const educationTimeline = [
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
    color: "#3B82F6" // Vibrant Blue
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
    color: "#06B6D4" // Vibrant Cyan
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
    color: "#8B5CF6" // Vibrant Purple
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
    color: "#EC4899" // Vibrant Pink
  }
];

export const educationHighlights = {
  currentLevel: "Diploma 🎓",
  stream: "Computer Engineering 💻",
  board: "State Technical Board 🏛️",
  yearOfStudy: "2nd Year 📅",
  cgpa: "8.2 / 10 ⭐",
  graduation: "2026 🎓"
};

export const educationSubjects = [
  "Data Structures 🌳",
  "Web Development 🌐",
  "Database Management 🗄️",
  "OOPs Concepts 🧩",
  "Operating Systems ⚙️",
  "Computer Networks 📡"
];

export const educationStats = [
  { value: "2+", label: "Years of Study", icon: "book" },
  { value: "15+", label: "Subjects Learned", icon: "code" },
  { value: "8.2", label: "CGPA (Current)", icon: "trophy" },
  { value: "5+", label: "Certifications", icon: "certificate" },
  { value: "100%", label: "Dedication", icon: "target" }
];

// Navigation links
export const navLinks = [
  { label: "Home",     href: "#home",     page: null },
  { label: "About",    href: "#about",    page: null },
  { label: "Projects", href: "/projects", page: "/projects" },
  { label: "Blog",     href: "/blog",     page: "/blog" },
  { label: "Contact",  href: "/contact",  page: "/contact" },
];

// Blog posts data
export const blogPosts = [
  {
    id: 1,
    title: "How I Built My AI-Powered Second Brain",
    excerpt: "A deep dive into building CEREBRO — a knowledge management platform that uses AI to connect ideas, auto-tag notes, and surface forgotten context when you need it most.",
    tag: "Project",
    tagColor: "#7C3AED",
    readTime: "8 min read",
    date: "Aug 20, 2025",
    emoji: "🧠",
    slug: "ai-second-brain",
    content: [
      { type: "paragraph", text: "Every developer I know has the same problem: you learn something cool, bookmark it, and never see it again. Notes scattered across Notion, Google Docs, browser bookmarks, and random .txt files. Sound familiar?" },
      { type: "heading", text: "The Problem With Traditional Note-Taking" },
      { type: "paragraph", text: "After 6 months of learning React, I had over 300 notes. But when I needed to remember how useMemo works in a specific context, I couldn't find it. The knowledge was there — but it wasn't connected. That's when I decided to build CEREBRO." },
      { type: "quote", text: "The goal was never to store information. The goal was to surface the right information at the right moment.", author: "My design principle for CEREBRO" },
      { type: "heading", text: "Building the Core: AI-Powered Tagging" },
      { type: "paragraph", text: "The first feature I tackled was auto-tagging. Instead of manually categorizing notes, CEREBRO analyzes the content using OpenAI's GPT API and suggests relevant tags. This sounds simple but getting the prompts right took days of iteration." },
      { type: "code", lang: "javascript", text: `// Auto-tag a note using OpenAI
async function autoTag(noteContent) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{
      role: "user",
      content: \`Analyze this note and return 3-5 relevant tags as JSON array.
      Note: \${noteContent}\`
    }]
  });
  return JSON.parse(response.choices[0].message.content);
}` },
      { type: "heading", text: "The Knowledge Graph" },
      { type: "paragraph", text: "The real magic happens when notes start connecting to each other. CEREBRO uses cosine similarity on vector embeddings to find semantically related notes — even if they don't share any keywords. This is what transforms a flat note-taking app into an actual second brain." },
      { type: "list", items: ["Vector embeddings via OpenAI text-embedding-3-small", "Graph visualization using D3.js force simulation", "Real-time similarity search with pgvector in PostgreSQL", "Automatic backlink generation between related notes"] },
      { type: "divider" },
      { type: "paragraph", text: "CEREBRO taught me more about system design, prompt engineering, and database optimization than any course ever could. Building something you actually want to use is the best way to learn." },
    ],
  },
  {
    id: 2,
    title: "React Performance Tips I Wish I Knew Earlier",
    excerpt: "From memo to lazy loading — the real-world patterns that cut my bundle size by 40% and made animations feel buttery smooth on low-end devices.",
    tag: "Tutorial",
    tagColor: "#10B981",
    readTime: "6 min read",
    date: "Jul 14, 2025",
    emoji: "⚡",
    slug: "react-performance-tips",
    content: [
      { type: "paragraph", text: "I used to think performance optimization was something you do after the app is slow. I was wrong. Here are the patterns that changed how I write React code from day one." },
      { type: "heading", text: "1. Stop Re-Rendering Everything" },
      { type: "paragraph", text: "The most common mistake beginners make is creating object/array literals inline in JSX. Every render creates a new reference, breaking React.memo completely." },
      { type: "code", lang: "jsx", text: `// ❌ Wrong — new object every render
<MyComponent style={{ color: 'red' }} />

// ✅ Right — stable reference
const style = { color: 'red' };
<MyComponent style={style} />

// ✅ Or use useMemo for computed values
const expensiveValue = useMemo(() => compute(data), [data]);` },
      { type: "heading", text: "2. Lazy Load Everything You Can" },
      { type: "paragraph", text: "Route-based code splitting is table stakes. But most developers don't apply it to heavy components like charts, rich text editors, or map libraries." },
      { type: "code", lang: "jsx", text: `const HeavyChart = lazy(() => import('./HeavyChart'));

function Dashboard() {
  return (
    <Suspense fallback={<Skeleton />}>
      <HeavyChart data={data} />
    </Suspense>
  );
}` },
      { type: "heading", text: "3. Virtualize Long Lists" },
      { type: "paragraph", text: "Rendering 500 DOM nodes is slow everywhere, especially on mobile. Use @tanstack/virtual or react-window to only render what's visible in the viewport." },
      { type: "divider" },
      { type: "quote", text: "Premature optimization is the root of all evil — but so is ignoring performance until your app is unusable.", author: "Me, painfully" },
    ],
  },
  {
    id: 3,
    title: "The Developer's Mindset: Learning Without Burning Out",
    excerpt: "I spent 6 months grinding and hit a wall. Here's how I restructured my learning schedule, picked better resources, and stayed consistent without losing passion.",
    tag: "Dev Life",
    tagColor: "#EC4899",
    readTime: "5 min read",
    date: "Jun 3, 2025",
    emoji: "🔥",
    slug: "developer-mindset",
    content: [
      { type: "paragraph", text: "In January 2025, I was learning 8 hours a day, 7 days a week. By March, I couldn't open VS Code without feeling dread. I had burned out completely. Here's what I learned from that experience." },
      { type: "heading", text: "The Warning Signs I Ignored" },
      { type: "list", items: ["Procrastinating on coding sessions I used to love", "Doom-scrolling instead of building projects", "Comparing my progress to others constantly", "Feeling guilty about taking breaks", "Code feeling like work, not exploration"] },
      { type: "heading", text: "What Actually Helped" },
      { type: "paragraph", text: "The biggest shift was moving from passive learning (watching tutorials) to active learning (building things that broke and forced me to figure out why). A 2-hour project session left me more energized than 6 hours of video courses." },
      { type: "quote", text: "You don't need to learn everything. You need to learn enough to build the next thing, and then learn what that teaches you.", author: "A mindset shift that saved my journey" },
      { type: "heading", text: "My New Schedule" },
      { type: "paragraph", text: "I now work in focused 90-minute blocks with 30-minute breaks. I never code more than 5 hours on any single day. And I take one full day off per week — no tutorials, no GitHub, nothing. This 'less is more' approach doubled my actual output." },
      { type: "divider" },
      { type: "paragraph", text: "Burnout isn't a badge of honor. Sustainable learning is more valuable than intense sprints that end in months of recovery. Protect your passion." },
    ],
  },
  {
    id: 4,
    title: "CSS Glassmorphism — From Zero to Production",
    excerpt: "Step-by-step guide to building beautiful glass cards that actually look good in dark mode, work across browsers, and don't murder performance.",
    tag: "CSS",
    tagColor: "#2563EB",
    readTime: "4 min read",
    date: "May 18, 2025",
    emoji: "🪟",
    slug: "css-glassmorphism",
    content: [
      { type: "paragraph", text: "Glassmorphism is one of those design trends that looks incredible when done right and terrible when done wrong. Here's the production-ready approach I use in every dark-mode project." },
      { type: "heading", text: "The Core CSS Pattern" },
      { type: "code", lang: "css", text: `.glass-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}` },
      { type: "heading", text: "The Mistakes Everyone Makes" },
      { type: "list", items: ["Using backdrop-filter on too many elements (destroys GPU performance)", "Setting blur too high — 12-20px is the sweet spot for most cases", "Forgetting the Safari -webkit- prefix (still needed as of 2025)", "Using white backgrounds instead of colored tints for depth"] },
      { type: "heading", text: "Performance Considerations" },
      { type: "paragraph", text: "backdrop-filter is GPU-accelerated but still expensive. Limit it to 3-5 elements per page. If you need many glass elements, consider using a blurred background image instead of live blur — it's 10x cheaper." },
      { type: "quote", text: "Good glassmorphism feels like depth. Bad glassmorphism feels like a frosted shower door on your UI.", author: "Design rule I live by" },
    ],
  },
  {
    id: 5,
    title: "My First Hackathon — What Went Right (and Wrong)",
    excerpt: "24 hours, 3 developers, one broken laptop. An honest breakdown of our hackathon experience, what we built, and every mistake we made along the way.",
    tag: "Story",
    tagColor: "#F59E0B",
    readTime: "7 min read",
    date: "Apr 30, 2025",
    emoji: "🏆",
    slug: "first-hackathon",
    content: [
      { type: "paragraph", text: "We registered for the hackathon on a Tuesday, thinking we'd have time to prepare. We did not prepare. Here's the full, unfiltered story of our 24-hour rollercoaster." },
      { type: "heading", text: "Hour 0-4: The Chaos of Starting" },
      { type: "paragraph", text: "We had three ideas and couldn't agree on any of them. We spent the first two hours arguing instead of building. Lesson #1: decide on an idea in 20 minutes, commit, and move on. Perfect is the enemy of shipped." },
      { type: "heading", text: "Hour 4-12: Finding Our Rhythm" },
      { type: "paragraph", text: "Once we started building, everything clicked. I handled the frontend, my teammate did the API integrations, and our third member focused on the pitch deck. Splitting responsibilities clearly was the best decision we made." },
      { type: "list", items: ["Frontend: React + Vite + Tailwind (my stack, fast to set up)", "Backend: Node + Express + MongoDB (deployed on Railway)", "AI Feature: OpenAI API for the core functionality", "Hosting: Vercel for the frontend, done in 3 minutes"] },
      { type: "heading", text: "The Laptop Incident" },
      { type: "paragraph", text: "At hour 16, my teammate's laptop died. No charger compatible with ours. We lost 2 hours while she borrowed one from another team. Always bring backup hardware or at least have everything in the cloud. We nearly lost 8 hours of work." },
      { type: "quote", text: "We didn't win. But we shipped a working product in 24 hours, which is more than most people ever do.", author: "My perspective at 3am" },
      { type: "divider" },
      { type: "paragraph", text: "We placed 4th. Not bad for our first hackathon. We're going back next month, and this time we have a plan." },
    ],
  },
  {
    id: 6,
    title: "Why Every Junior Dev Should Build a Portfolio NOW",
    excerpt: "Not tomorrow, not after one more course. A portfolio is your live resume — here's how to start from scratch even if you only have one project.",
    tag: "Career",
    tagColor: "#06B6D4",
    readTime: "5 min read",
    date: "Mar 22, 2025",
    emoji: "🚀",
    slug: "build-portfolio-now",
    content: [
      { type: "paragraph", text: "I waited 4 months before building my portfolio. I kept telling myself 'I'll build it after I finish this course' or 'I need more projects first.' Both excuses were wrong. Here's why you should start today." },
      { type: "heading", text: "The Portfolio Paradox" },
      { type: "paragraph", text: "Junior developers think they need to earn the right to a portfolio. The reality is the opposite — a portfolio is how you earn opportunities. Even one good project, well-presented, can open doors that 50 LeetCode problems won't." },
      { type: "quote", text: "A portfolio isn't a showcase of what you've done. It's evidence of what you can do.", author: "Career advice that changed my perspective" },
      { type: "heading", text: "What to Include With Just One Project" },
      { type: "list", items: ["The project itself with a live demo link", "Your GitHub with clean, commented code", "A brief 'About Me' that shows personality, not just skills", "A contact form that actually works", "Tech stack badges (they signal competence quickly)"] },
      { type: "heading", text: "The Tech Stack That Gets You Live in a Weekend" },
      { type: "paragraph", text: "For a portfolio, you don't need Next.js or complex backends. Plain HTML, CSS, and JavaScript deployed on Vercel or Netlify is completely sufficient and often faster to build than a framework-based solution." },
      { type: "code", lang: "bash", text: `# Deploy a portfolio in 3 commands
npx create-vite-app my-portfolio --template vanilla
cd my-portfolio
npm run dev` },
      { type: "divider" },
      { type: "paragraph", text: "Stop waiting for perfect. Ship something real. Recruiters don't hire potential — they hire people who ship. Be someone who ships." },
    ],
  },
];
