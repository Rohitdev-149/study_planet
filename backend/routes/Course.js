const express = require("express");
const router = express.Router();

// import the required controllers
const {
  createCourse,
  getAllCourses,
  getCourseDetails,
} = require("../controllers/Course");
// categories controller import
const {
  createCategory,
  getAllCategories,
  categoryPageDetails,
} = require("../controllers/Category");

// sub section controller import
const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../controllers/SubSection");
//rating controller import
const {
  createRatingAndReview,
  getAverageRating,
  getAllRatingsAndReviews,
} = require("../controllers/RatingAndReview");

// import middlewares
const {
  auth,
  isInstructor,
  isStudent,
  isAdmin,
} = require("../middlewares/auth");

const { getCloudinarySignature } = require("../controllers/Cloudinary");

// course routes
router.get("/cloudinary-signature", auth, isInstructor, getCloudinarySignature);
router.post("/create-course", auth, isInstructor, createCourse);
router.get("/all-courses", getAllCourses);
router.get("/course-details/:courseId", getCourseDetails);
// category routes
router.get("/all-categories", getAllCategories);
router.post("/create-category", auth, isAdmin, createCategory);
router.get("/category-page-details/:categoryId", categoryPageDetails);
// sub section routes
router.post(
  "/create-sub-section/:courseId",
  auth,
  isInstructor,
  createSubSection
);
router.put(
  "/update-sub-section/:subSectionId",
  auth,
  isInstructor,
  updateSubSection
);
router.delete(
  "/delete-sub-section/:subSectionId",
  auth,
  isInstructor,
  deleteSubSection
);
// rating routes
router.post("/create-rating/:courseId", auth, isStudent, createRatingAndReview);
router.get("/average-rating/:courseId", getAverageRating);
router.get("/all-ratings/:courseId", getAllRatingsAndReviews);
module.exports = router;
