require("dotenv").config();
const fetch = require("node-fetch");
const categoriesToAdd = [
  {
    name: "Web Development",
    description: "HTML, CSS, JavaScript and modern frameworks",
  },
  {
    name: "Data Science",
    description: "Statistics, Python, Pandas and Machine Learning",
  },
  {
    name: "Mobile Development",
    description: "Android and iOS app development",
  },
  { name: "Cloud & DevOps", description: "AWS, Docker, CI/CD and deployment" },
  { name: "AI & ML", description: "Deep Learning and AI-driven applications" },
  {
    name: "UI/UX Design",
    description: "Design systems, Figma and prototyping",
  },
  {
    name: "Cybersecurity",
    description: "Network security and ethical hacking",
  },
];

const API_BASE = "http://localhost:4000/api/v1";

(async function seed() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.Admin_Email;
    const adminPassword =
      process.env.ADMIN_PASSWORD || process.env.Admin_Password;
    if (!adminEmail || !adminPassword) {
      console.error(
        "Admin credentials not found in env. Set ADMIN_EMAIL and ADMIN_PASSWORD or Admin_Email and Admin_Password"
      );
      process.exit(1);
    }

    // Login
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    });
    const loginJson = await loginRes.json();
    if (!loginJson.success) {
      console.error("Login failed:", loginJson);
      process.exit(1);
    }
    const token = loginJson.token;
    if (!token) {
      console.error("No token received on login");
      process.exit(1);
    }

    // Create categories
    for (const cat of categoriesToAdd) {
      const res = await fetch(`${API_BASE}/course/createCategory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cat),
      });
      const j = await res.json();
      console.log(
        cat.name,
        "=>",
        j.success ? "created" : "skipped/fail",
        j.message || j
      );
    }

    console.log("Done");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
})();
