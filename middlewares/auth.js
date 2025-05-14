import jwt from "jsonwebtoken";
import { Auth } from "../models/authModel.js";

export const isAuthenticated = async (req, res, next) => {
  const { sessionToken } = req.cookies;

  if (!sessionToken) {
    return res.status(404).json({
      success: false,
      message: "Login First",
    });
  }

  const decode = jwt.verify(sessionToken, process.env.JWT_SECRET);

  req.user = await Auth.findById(decode._id);
  next();
};
