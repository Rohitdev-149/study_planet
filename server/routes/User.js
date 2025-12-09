const express = require("express");
const router = express.Router();

const {
  signIn,
  signUp,
  sendOTP,
  changePassword,
} = require("../controllers/Auth");
const {
  resetPassword,
  resetPasswordToken,
} = require("../controllers/ResetPassword");
const { auth } = require("../middlewares/auth");
// routes for authentication
router.post("/login", signIn);
router.post("/signup", signUp);
router.post("/sendotp", sendOTP);
router.post("/change-password", auth, changePassword);

// Reset Password routes
router.post("/reset-password-token", resetPasswordToken);
router.post("/reset-password", resetPassword);

module.exports = router;