// Handler function to wrap each route with error handling.
exports.asyncHandler = (cb) => {
  // Return an asynchronous function that wraps the callback function.
  return async (req, res, next) => {
    try {
      // Call the callback function with the request, response, and next arguments.
      await cb(req, res, next);
    } catch (error) {
      // If an error is thrown, pass it to the global error handler.
      next(error);
    }
  }
}
