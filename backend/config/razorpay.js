// const Razorpay = require("razorpay");

// if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
//   console.error("Missing Razorpay credentials in environment variables");
//   console.log("Required environment variables:");
//   console.log("- RAZORPAY_KEY_ID");
//   console.log("- RAZORPAY_KEY_SECRET");
//   process.exit(1);
// }

// exports.instance = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// Mock Razorpay instance for development without API keys
const mockRazorpay = {
    orders: {
        create: async (options) => ({
            id: 'mock_order_' + Date.now(),
            amount: options.amount,
            currency: options.currency,
            receipt: options.receipt
        })
    },
    payments: {
        capture: async (paymentId, amount) => ({
            id: paymentId,
            amount: amount,
            status: 'captured'
        }),
        fetch: async (paymentId) => ({
            id: paymentId,
            amount: 1000,
            status: 'authorized'
        })
    }
};

// Export mock instance for development
exports.instance = mockRazorpay;