class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    // Set the error message and status code
    this.message = message || "Something went wrong!";
    this.statusCode = statusCode || 500;

    // Capture the stack trace
    Error.captureStackTrace(this, this.constructor);

    // Flag for operational errors (can be set to true)
    this.isOperational = true;
  }
}

export default ErrorHandler;
