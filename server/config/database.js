const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
  const mongoUrl = process.env.MONGODBURL;
  if (!mongoUrl) {
    console.error(
      "MONGODBURL is not set. Please add MONGODBURL to your .env (e.g. mongodb://127.0.0.1:27017/yourdb)"
    );
    // Do not exit the process here to allow development without DB (optional)
    return Promise.resolve();
  }

  // Use the default options for the current mongodb driver; avoid deprecated options
  return mongoose
    .connect(mongoUrl)
    .then(() => console.log("DB Connection Successful"))
    .catch((error) => {
      console.error("DB Connection Unsuccessful");
      console.error(error);
      process.exit(1);
    });
};
