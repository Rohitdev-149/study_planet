const mongoose = require("mongoose");
const { mailSender } = require("../utils/mailSender");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Evaluated dynamically at record insertion
    expires: 5 * 60, // 5 minutes TTL
  },
});

// Function to send verification email
async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification email from StudyPlanet",
      `Your verification OTP is: ${otp}`
    );
    console.log("Email sent successfully", mailResponse);
  } catch (error) {
    console.error("Error occurred while sending email", error);
    throw error;
  }
}

// Pre-save hook to send verification email before saving OTP
otpSchema.pre("save", async function (next) {
  await sendVerificationEmail(this.email, this.otp);
  next();
});

module.exports = mongoose.model("OTP", otpSchema);
