// Import the required modules
const express = require("express");
const router = express.Router();

// Payment logic is temporarily disabled
// const { capturePayment, verifyPayment, sendPaymentSuccessEmail } = require("../controllers/Payments")
const {
  auth,
  isInstructor,
  isStudent,
  isAdmin,
} = require("../middlewares/auth");

// Disabled payment endpoints - return disabled message
router.post("/capturePayment", (req, res) => {
  return res.status(503).json({
    success: false,
    message:
      "Payment service is currently disabled. Please configure Razorpay credentials to enable payment features.",
  });
});

router.post("/verifyPayment", (req, res) => {
  return res.status(503).json({
    success: false,
    message:
      "Payment service is currently disabled. Please configure Razorpay credentials to enable payment features.",
  });
});

router.post("/sendPaymentSuccessEmail", (req, res) => {
  return res.status(503).json({
    success: false,
    message:
      "Payment service is currently disabled. Please configure Razorpay credentials to enable payment features.",
  });
});

// Original payment routes (commented out for now)
// router.post("/capturePayment", auth, isStudent, capturePayment)
// router.post("/verifyPayment",auth, isStudent, verifyPayment)
// router.post("/sendPaymentSuccessEmail", auth, isStudent, sendPaymentSuccessEmail);

module.exports = router;
