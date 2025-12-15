const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
  if (!process.env.MONGODB_URL) {
    console.error("Error: MONGODB_URL is not set in environment variables.");
    console.error(
      "Please set MONGODB_URL in your .env file to connect to MongoDB."
    );
    console.error("Example: MONGODB_URL=mongodb://localhost:27017/studyplanet");
    process.exit(1);
  }

  mongoose
    .connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("DB Connected Successfully"))
    .catch((error) => {
      console.log("DB Connection Failed");
      console.error(error);
      console.error(
        "Please check your MONGODB_URL and ensure MongoDB is running."
      );
      process.exit(1);
    });
};
