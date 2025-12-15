require("dotenv").config();
const database = require("../config/database");
const Category = require("../models/Category");

(async function list() {
  try {
    database.connect();
    const cats = await Category.find({});
    console.log("Found", cats.length, "categories");
    cats.forEach((c) => console.log("-", c.name));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
