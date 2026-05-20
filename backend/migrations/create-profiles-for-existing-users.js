const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const Profile = require("../models/Profile");

dotenv.config();

async function migrate() {
  await mongoose.connect(process.env.MONGODBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to DB for migration");
  try {
    const usersWithoutProfile = await User.find({ additionalDetails: null });
    console.log("Found", usersWithoutProfile.length, "users without profile");
    for (const user of usersWithoutProfile) {
      const profile = await Profile.create({
        gender: null,
        dateOfBirth: null,
        about: null,
        contactNumber: null,
      });
      user.additionalDetails = profile._id;
      await user.save();
      console.log(`Created profile for user ${user.email} -> ${profile._id}`);
    }
    console.log("Migration completed");
  } catch (error) {
    console.error("Migration error", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrate();
