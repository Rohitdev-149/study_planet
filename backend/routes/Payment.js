const express = require("express");
const router = express.Router();

const { capturePayment, verifySignature } = require("../controllers/Payment");
const {
  auth,
  isInstructor,
  isStudent,
  isAdmin,
} = require("../middlewares/auth");
router.post("/capture-payment/:courseId", auth, isStudent, capturePayment);
router.post("/verify-signature", auth, verifySignature);
module.exports = router;
