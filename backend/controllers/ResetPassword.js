const User = require("../models/User");
const { mailSender } = require("../utils/mailSender");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

// reset password token
exports.resetPasswordToken = async (req, res) => {
  try {
    // fetch email from request body
    const email = req.body.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email address",
      });
    }

    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // generate reset token
    const resetToken = crypto.randomUUID();

    // update user with reset token and expiry time
    const updateDetail = await User.findOneAndUpdate(
      { email: email },
      {
        resetToken: resetToken, // Changed from token to resetToken
        resetPasswordExpires: Date.now() + 5 * 60 * 1000, // 5 minutes
      },
      { new: true } // to return updated document
    );

    if (!updateDetail) {
      return res.status(500).json({
        success: false,
        message: "Error updating user with reset token",
      });
    }

    //create reset password url
    const url = `http://localhost:3000/resetpassword/${resetToken}`;

    // send email to user
    await mailSender(
      email,
      "Password Reset Request",
      `Click the link to reset your password: ${url}. This link is valid for 5 minutes.`
    );
    // return response
    return res.status(200).json({
      success: true,
      message: "Reset password link sent to your email",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// reset password
exports.resetPassword = async (req, res) => {
  try {
    // fetch data from request body
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // validate password and confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password do not match",
      });
    }

    // find user with reset token and check if token is not expired
    const userDetail = await User.findOne({
      resetToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!userDetail) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // update password and clear reset token fields
    await User.findOneAndUpdate(
      { resetToken: token },
      {
        password: hashedPassword,
        resetToken: null,
        resetPasswordExpires: null,
      },
      { new: true }
    );
    // return response
    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
