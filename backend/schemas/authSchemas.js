const { z } = require("zod");

/**
 * Login Schema Validator
 */
const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .email("Invalid email format"),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters long"),
  }),
});

/**
 * OTP Request Schema Validator
 */
const sendOtpSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .email("Invalid email format"),
  }),
});

module.exports = {
  loginSchema,
  sendOtpSchema,
};
