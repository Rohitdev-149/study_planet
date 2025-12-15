require("dotenv").config();
const database = require("../config/database");
const User = require("../models/User");
const Profile = require("../models/Profile");
const bcrypt = require("bcryptjs");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
const ADMIN_FIRSTNAME = process.env.ADMIN_FIRSTNAME || "Admin";
const ADMIN_LASTNAME = process.env.ADMIN_LASTNAME || "User";

(async function createAdmin() {
  try {
    database.connect();

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`Admin already exists: ${ADMIN_EMAIL}`);
      process.exit(0);
    }

    const profile = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: "Admin account",
      contactNumber: null,
    });

    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const user = await User.create({
      firstName: ADMIN_FIRSTNAME,
      lastName: ADMIN_LASTNAME,
      email: ADMIN_EMAIL,
      password: hashed,
      accountType: "Admin",
      approved: true,
      additionalDetails: profile._id,
    });

    console.log("Admin user created:");
    console.log(`  email: ${ADMIN_EMAIL}`);
    console.log(`  password: ${ADMIN_PASSWORD}`);
    console.log("You can now login at POST /api/v1/auth/login");
    process.exit(0);
  } catch (err) {
    console.error("Failed to create admin:", err);
    process.exit(1);
  }
})();
