import ErrorHandler from "../utils/errorHandler.js";

export const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return next(new ErrorHandler("Access denied: Admins only", 403));
  }

  next();
};
