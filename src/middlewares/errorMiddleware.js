const logger = require('../utils/logger');
const { sendError } = require('../utils/apiResponse');

/**
 * 404 Route Not Found Middleware
 */
const notFoundHandler = (req, res) => {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

/**
 * Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  logger.error(`Error processing ${req.method} ${req.originalUrl}:`, err);

  // Prisma Unique Constraint Violation
  if (err.code === 'P2002') {
    const target = err.meta?.target ? ` on field '${err.meta.target}'` : '';
    return sendError(
      res,
      `A record with this unique identifier already exists${target}.`,
      409,
      [{ field: err.meta?.target || 'unknown', message: 'Unique constraint violation' }]
    );
  }

  // Prisma Record Not Found
  if (err.code === 'P2025') {
    return sendError(res, err.meta?.cause || 'The requested record was not found.', 404);
  }

  // Prisma Foreign Key Constraint Failure
  if (err.code === 'P2003') {
    return sendError(
      res,
      `Foreign key constraint failed on field '${err.meta?.field_name || 'relation'}'.`,
      400
    );
  }

  // Syntax or Parsing Error (e.g. invalid JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 'Invalid JSON payload received', 400);
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : (process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message);

  return sendError(res, message, statusCode, err.errors || null);
};

module.exports = {
  notFoundHandler,
  errorHandler
};
