const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");

// DEBUG ONLY: Temporary route to test file upload without auth
router.put("/debug-upload", async (req, res) => {
  try {
    console.log("Debug route hit. Headers:", req.headers);
    console.log("Files received:", req.files);

    if (!req.files || !req.files.displayPicture) {
      return res.status(400).json({
        success: false,
        message: "No file received",
        debug: {
          filesExist: !!req.files,
          keys: req.files ? Object.keys(req.files) : [],
          contentType: req.headers["content-type"],
        },
      });
    }

    const file = req.files.displayPicture;
    console.log("File details:", {
      name: file.name,
      size: file.size,
      mimetype: file.mimetype,
      tempFilePath: file.tempFilePath || file.tempfilePath,
    });

    return res.json({
      success: true,
      message: "File received",
      file: {
        name: file.name,
        type: file.mimetype,
        size: file.size,
      },
    });
  } catch (error) {
    console.error("Debug route error:", error);
    return res.status(500).json({
      success: false,
      message: "Debug route error",
      error: error.message,
    });
  }
});

const {
  deleteAccount,
  updateProfile,
  getAllUserDetails,
  updateDisplayPicture,
  getEnrolledCourses,
} = require("../controllers/Profile");
// health check for profile routes
router.get("/ping", (req, res) =>
  res.status(200).json({ success: true, message: "profile route working" })
);
// delete user account
router.delete("/delete-account", auth, deleteAccount);
// update user profile
router.put("/update-profile", auth, updateProfile);
// get all user details
router.get("/get-user-details", auth, getAllUserDetails);
// update display picture
router.put("/update-display-picture", auth, updateDisplayPicture);
// get enrolled courses
router.get("/enrolled-courses", auth, getEnrolledCourses);
module.exports = router;
