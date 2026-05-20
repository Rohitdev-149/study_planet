/**
 * Asynchronous Controller Error Decorator
 * Wraps async Express actions and forwards any thrown errors or rejected promises
 * directly to the centralized global error handler via next(error).
 * 
 * @param {Function} fn - Asynchronous Express route handler
 * @returns {Function} Wrapped Express route handler
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
