const Razorpay = require("razorpay");

let razorpayInstance = null;

// Conditional initialization - only initialize if credentials are available
if (process.env.RAZORPAY_KEY && process.env.RAZORPAY_SECRET) {
  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_SECRET,
    });
  } catch (error) {
    console.warn(
      "Warning: Failed to initialize Razorpay. Payment features will not work.",
      error.message
    );
  }
} else {
  console.warn(
    "Warning: Razorpay credentials (RAZORPAY_KEY, RAZORPAY_SECRET) are not set. Payment features will not work."
  );
}

// Export instance (will be null if not configured)
exports.instance = razorpayInstance;
