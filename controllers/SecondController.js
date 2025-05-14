import fs from "fs";
import path from "path";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import Student from "../models/studentModel.js";
import { generateSecondCertificate } from "../utils/generateSecondCertificate.js";

export const getSecondCertificate = catchAsyncError(async (req, res, next) => {
  const { enrollmentId } = req.params;
  const student = await Student.findOne({ enrollmentId });
  if (!student) {
    return next(
      new ErrorHandler("❌ Invalid enrollment ID. No record found.", 404)
    );
  }

  const buffer = await generateSecondCertificate(enrollmentId);

  res.set("Content-Type", "image/png");
  res.set("Content-Disposition", `inline; filename=${enrollmentId}.png`);

  return res.send(buffer);
});
