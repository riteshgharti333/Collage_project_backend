import fs from "fs";
import path from "path";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import Marksheet from "../models/marksheetModel.js";
import { printMarksheet } from "../utils/generateMarksheet.js";

export const printCertificate = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const marksheet = await Marksheet.findById(id);

  if (!marksheet) {
    return next(new ErrorHandler("❌ Invalid ID. No record found.", 404));
  }

  const buffer = await printMarksheet(id);

  res.set("Content-Type", "image/png");
  res.set("Content-Disposition", `inline; filename=${marksheet._id}.png`);

  return res.send(buffer);
});
