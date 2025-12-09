const express = require("express");
const router = express.Router();

// import the required controllers
const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/Section");

// import middlewares
const { auth, isInstructor } = require("../middlewares/auth");

// section routes with proper validation and authentication
router.post("/create-section", auth, isInstructor, createSection);
router.put("/update-section", auth, isInstructor, updateSection);
router.delete("/delete-section/:sectionId", auth, isInstructor, deleteSection);

module.exports = router;
