import rateLimit from "express-rate-limit";

export const loginRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 5,
  message: {
    result: 0,
    message: "Too many login attempts. Please try again after 1 day.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});
