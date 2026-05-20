const { BadRequestError } = require("../utils/customErrors");

/**
 * Express Request Schema Validation Middleware
 * Validates request payload shapes before reaching business controller execution.
 * 
 * @param {z.ZodSchema} schema - Zod schema to parse against
 */
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    // Collect all failed schema path validation violations
    const messages = error.errors
      .map((e) => `${e.path.slice(1).join(".")}: ${e.message}`)
      .join(", ");
    
    // Throw standard BadRequest operational exception caught by error boundary
    next(new BadRequestError(`Validation failed: ${messages}`));
  }
};

module.exports = validate;
