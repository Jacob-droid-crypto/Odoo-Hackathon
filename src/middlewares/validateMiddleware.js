const { sendError } = require('../utils/apiResponse');

/**
 * Zod validation middleware for request body, query, and params
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsed = schema.safeParse(dataToValidate);

      if (!parsed.success) {
        const errorDetails = parsed.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }));

        return sendError(
          res,
          `Validation failed for ${source}: ${errorDetails.map(e => `${e.field}: ${e.message}`).join(', ')}`,
          400,
          errorDetails
        );
      }

      // Replace with sanitized/coerced data
      req[source] = parsed.data;
      return next();
    } catch (err) {
      return sendError(res, 'Validation error: ' + err.message, 400);
    }
  };
};

module.exports = {
  validate
};
