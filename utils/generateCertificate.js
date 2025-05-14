import { createCanvas, loadImage, registerFont } from "canvas";
import fs from "fs";
import path from "path";
import Student from "../models/studentModel.js";
import ErrorHandler from "../utils/errorHandler.js";

const fontPath = path.resolve(
  "fonts",
  "static",
  "DMSans_18pt-SemiBoldItalic.ttf"
);

registerFont(fontPath, { family: "DMSans", weight: "300", style: "italic" });

export const generateCertificate = async (enrollmentId) => {
  try {
    const student = await Student.findOne({ enrollmentId });

    if (!student) {
      throw new ErrorHandler(`No student found with ID ${enrollmentId}`, 404);
    }

    const templatePath = path.join("templates", "template.jpeg");
    const image = await loadImage(templatePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const date = new Date(student.date);
    const formattedDate = `${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()}`;

    ctx.fillStyle = "#000";
    ctx.font = "italic 22px DMSans";

    const drawTextWithSpacing = (text, x, y, spacing) => {
      let currentX = x;
      for (const char of text) {
        ctx.fillText(char, currentX, y);
        currentX += ctx.measureText(char).width + spacing;
      }
    };

    const drawTextWithSpacingCentered = (text, y, spacing) => {
      let totalWidth = 0;
      for (const char of text) {
        totalWidth += ctx.measureText(char).width + spacing;
      }
      totalWidth -= spacing;
      const startX = canvas.width / 2 - totalWidth / 2;

      let currentX = startX;
      for (const char of text) {
        ctx.fillText(char, currentX, y);
        currentX += ctx.measureText(char).width + spacing;
      }
    };

    drawTextWithSpacing(`${student.certificateNo}`, 100, 210, 6);
    drawTextWithSpacing(`${student.enrollmentId}`, 990, 210, 6);
    drawTextWithSpacingCentered(`${student.name}`, 450, 6);
    drawTextWithSpacingCentered(`${student.course}`, 540, 6);
    drawTextWithSpacingCentered(`${student.duration} Year`, 635, 6);
    drawTextWithSpacingCentered(formattedDate, 710, 6);

    return canvas.toBuffer("image/png");
  } catch (error) {
    console.error("Certificate generation error:", error);
    throw error;
  }
};

