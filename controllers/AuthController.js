import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Auth } from "../models/authModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendCookie } from "../utils/features.js";
import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import nodemailer from "nodemailer";

// REGISTER
export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ErrorHandler("All fields are required!", 400);
  }

  const existingUser = await Auth.findOne({ email });

  if (existingUser) {
    throw new ErrorHandler("Email Already Registered", 409);
  }

  const isAdmin = email === process.env.ADMIN_EMAIL;

  const user = await Auth.create({ name, email, password, isAdmin });

  user.password = undefined;

  res.status(201).json({
    result: 1,
    message: "Registered Successfully",
    user,
  });
});

// LOGIN
export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Email and Password are required", 400));
  }

  const user = await Auth.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  user.password = undefined;

  sendCookie(user, res, "Login Successfully", 200);
});

// LOGOUT
export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("sessionToken", "", {
      expires: new Date(0),
      sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
      secure: process.env.NODE_ENV !== "Development",
      httpOnly: true,
    })
    .json({
      result: 1,
      message: "Logout Successfully",
    });
});

// PROFILE
export const profile = catchAsyncError(async (req, res, next) => {
  console.log(req.user)
  if (!req.user) {
    return next(
      new ErrorHandler("Unauthorized: Please login to access profile", 401)
    );
  }

  const user = await Auth.findById(req.user.id).select("-password");

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    result: 1,
    message: "Profile fetched successfully",
    user,
  });
});

// UPDATE PASSWORD USING SESSION TOKEN
export const changePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return next(
      new ErrorHandler("Old password and new password are required", 400)
    );
  }

  if (!req.user || !req.user.id) {
    return next(
      new ErrorHandler(
        "Unauthorized: You must be logged in to change password",
        401
      )
    );
  }

  const user = await Auth.findById(req.user.id).select("+password");

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return next(new ErrorHandler("Invalid old password", 401));
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    return next(
      new ErrorHandler("New password cannot be the same as the old one", 400)
    );
  }

  await user.updatePassword(newPassword);

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});
