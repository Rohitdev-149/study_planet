const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { mailSender } = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");

require("dotenv").config();
//  send OTP
exports.sendOTP = async (req, res) => {
  try {
    // fetch email from request body
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required to send OTP.",
      });
    }
    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered",
      });
    }
    // generate OTP
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP Generated:", otp);
    // check unique otp ot not
    let result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }
    // save OTP to database
    console.log("Saving OTP to database:", { email, otp });
    const otpPayLoad = {
      email,
      otp,
      createdAt: new Date(), // Ensure we have a fresh timestamp
    };

    const otpBody = await OTP.create(otpPayLoad);
    console.log("OTP saved:", otpBody);

    // send OTP email with HTML template
    const otpEmailTemplate = require("../mail/templates/otpEmailTemplate");
    await mailSender(email, "Your OTP Code", otpEmailTemplate(otp));

    // return response
    res.status(200).json({
      success: true,
      message: "OTP sent successfully. Please use it within 5 minutes.",
      OTP: otp,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in sending OTP",
      error: error.message,
    });
  }
};
// sign up
exports.signUp = async (req, res) => {
  try {
    // fetch data from request body
    const {
      firstName,
      lastName,
      email,
      accountType,
      password,
      confirmPassword,
      contactNumber,
      otp,
    } = req.body;
    // validate data
    if (
      !firstName ||
      !lastName ||
      !email ||
      !accountType ||
      !password ||
      !confirmPassword ||
      !contactNumber ||
      !otp
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    // check password and confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password do not match",
      });
    }
    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    // verify OTP
    console.log("Verifying OTP for email:", email);
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log("Found OTP record:", recentOtp);
    console.log("Recent OTP:", recentOtp, "Provided OTP:", otp);

    if (!recentOtp || recentOtp.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP.",
      });
    }

    // Compare OTP (convert both to string to ensure consistent comparison)
    const storedOtp = recentOtp[0].otp.toString();
    const providedOtp = otp.toString();

    if (storedOtp !== providedOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
        //debug: { stored: storedOtp, provided: providedOtp },
      });
    }
    // hahsh password
    const hashedPassword = await bcrypt.hash(password, 10);
    // create entry in database
    const profileDetail = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      accountType,
      password: hashedPassword,
      contactNumber,
      additionalDetails: profileDetail._id,
      image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}`,
    });
    // return response
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in signing up",
      error: error.message,
    });
  }
};
// sign in
exports.signIn = async (req, res) => {
  try {
    // fetch data from request body
    const { email, password } = req.body;
    // validate data
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    // check if user exists (case-insensitive email comparison)
    console.log("Attempting to find user with email:", email);
    const user = await User.findOne({
      email: { $regex: new RegExp("^" + email + "$", "i") },
    });
    console.log("User found:", user ? "Yes" : "No");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sign up.",
      });
    }
    // compare password and generate jwt token
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        id: user._id, // Changed from userId to id to match what auth middleware expects
        email: user.email,
        accountType: user.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      // persist token to user document
      user.token = token;
      await user.save();

      // prepare sanitized user object for response
      const safeUser = {
        ...user.toObject(),
        password: undefined,
        __v: undefined,
      };

      // create a cookie
      const options = {
        expires: new Date(Date.now() + 3600000), // 1 hour
        httpOnly: true,
      };

      res.cookie("token", token, options).status(200).json({
        success: true,
        token: token,
        user: safeUser,
        message: "User signed in successfully",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in signing in",
      error: error.message,
    });
  }
};
// change password
exports.changePassword = async (req, res) => {
  try {
    // fetch data from request body
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.user.id; // assuming this comes from auth middleware

    // validate data
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New Password and Confirm New Password do not match",
      });
    }

    // get user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // verify old password
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect old password",
      });
    }

    // hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // update password in database
    user.password = hashedNewPassword;
    await user.save();

    // Send email notification about password change
    try {
      const emailResponse = await mailSender(
        user.email,
        "Password Changed Successfully",
        passwordUpdated(user.email, user.firstname)
      );
      console.log("Email sent successfully:", emailResponse);
    } catch (error) {
      console.error("Error sending email:", error);
      // Don't return here, as password change was successful even if email fails
    }

    // return response
    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in changing password",
      error: error.message,
    });
  }
};
