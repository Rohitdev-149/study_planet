const { AppError } = require("../utils/customErrors");

/**
 * Centralised Express Error Interceptor
 * Formats errors uniformly, logs unhandled runtime bugs, and prevents system info leaks.
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Detailed debug error logs for local development
  if (process.env.NODE_ENV === "development") {
    console.error("[Express Error Trace] ->", err);
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }

  // Secure production execution
  if (err.isOperational) {
    // Operational, trusted error: send clean API messages to student clients
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  }

  // Unhandled programming bugs (NullPointer, Syntax errors, DB lock failures)
  // Hide internal database structures or server paths from users; log details internally.
  console.error("[FATAL SYSTEM EXCEPTION] ->", err);
  return res.status(500).json({
    success: false,
    message: "Something went wrong internally. Please try again later.",
  });
};

module.exports = errorHandler;
