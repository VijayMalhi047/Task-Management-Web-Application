// middleware/errorHandler.js
// ─────────────────────────────────────────────────────────────
// RESPONSIBILITY: A single, centralized place where all unhandled
// errors in the application are caught and formatted into a
// consistent JSON response.
//
// WHY CENTRALIZED?
// Without this, every controller would need its own try/catch with
// its own res.status().json() error format. That leads to
// inconsistent responses and duplicated code. Instead, controllers
// simply call next(err) and this middleware takes over.
//
// HOW EXPRESS IDENTIFIES THIS AS AN ERROR HANDLER:
// Express uses the number of function arguments (arity) to distinguish
// regular middleware from error-handling middleware. The signature
// MUST have exactly 4 parameters: (err, req, res, next).
// Even if you don't use 'next', it must be declared.
// ─────────────────────────────────────────────────────────────

const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  // Log the full error stack to the terminal for debugging.
  // In production you'd pipe this to a logging service (e.g. Sentry, Datadog).
  console.error(`[Error] ${req.method} ${req.url} →`, err.message);

  // Use the error's own statusCode if a controller set one,
  // otherwise fall back to 500 (Internal Server Error).
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    error: err.message || "An unexpected server error occurred.",

    // Only expose the stack trace in development.
    // Never send stack traces to clients in production — it leaks internals.
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;