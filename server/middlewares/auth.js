const jwt = require("jsonwebtoken");
require("dotenv").config();

// authentication middleware
exports.auth = (req, res, next) => {
  try {
    // get token from headers
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }
    // verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid token.",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// isStudent middleware
exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Students only.",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified",
      error: error.message,
    });
  }
};

// isInstructor middleware
exports.isInstructor = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Instructor") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Instructor only.",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified",
      error: error.message,
    });
  }
};

// isAdmin middleware
exports.isAdmin = async (req, res, next) => {
  try {
    console.log("User data in isAdmin:", {
      accountType: req.user.accountType,
      user: req.user,
    });

    if (req.user.accountType !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
        debug: {
          expectedType: "Admin",
          actualType: req.user.accountType,
        },
      });
    }
    next();
  } catch (error) {
    console.error("Error in isAdmin middleware:", error);
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified",
      error: error.message,
    });
  }
};
