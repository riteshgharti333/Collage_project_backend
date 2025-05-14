// Error Handling Middleware
export const errorMiddleware = (err, req, res, next) => {
  // Default message and status
  let message = err.message || "Internal Server Error!";
  let statusCode = err.statusCode || 500;

  // Log the error for debugging
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format!";
  }

  // ✅ Handle specific network-related errors
  if (err.code === "ECONNREFUSED") {
    message = "Server is unreachable. Please try again later.";
    statusCode = 503; // Service Unavailable
  }

  if (err.code === "ETIMEDOUT") {
    message = "Request timed out. Please try again.";
    statusCode = 504; // Gateway Timeout
  }

  // ⚠️ Handle Mongoose Validation Errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // ⚠️ Handle Duplicate Key Errors
  if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate value entered!";
  }

  // Send the response
  res.status(statusCode).json({
    result: 0,
    message: message,
  });
};
