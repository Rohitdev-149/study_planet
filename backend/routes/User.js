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
const validate = require("../middlewares/validation");
const { loginSchema, sendOtpSchema } = require("../schemas/authSchemas");

// routes for authentication
router.post("/login", validate(loginSchema), signIn);
router.post("/signup", signUp);
router.post("/sendotp", validate(sendOtpSchema), sendOTP);
router.post("/change-password", auth, changePassword);

// Reset Password routes
router.post("/reset-password-token", resetPasswordToken);
router.post("/reset-password", resetPassword);

module.exports = router;