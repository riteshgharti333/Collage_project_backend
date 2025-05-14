export const catchAsyncError = (passedFuntion) => (req, res, next) => {
  Promise.resolve(passedFuntion(req, res, next)).catch(next);
};
