import { createCanvas, loadImage, registerFont } from "canvas";
import fs from "fs";
import path from "path";
import Student from "../models/studentModel.js";
import ErrorHandler from "./errorHandler.js";

const fontPath = path.resolve(
  "fonts",
  "static",
  "DMSans_18pt-SemiBoldItalic.ttf"
);

registerFont(fontPath, { family: "DMSans", weight: "300", style: "italic" });

export const generateSecondCertificate = async (enrollmentId) => {
  try {
    const student = await Student.findOne({ enrollmentId });

    if (!student) {
      throw new ErrorHandler(
        `No student found with enrollment ID: ${enrollmentId}`,
        404
      );
    }

    // ✅ Load base certificate image
    const templatePath = path.join("templates", "second.jpeg");
    const outputPath = path.join(
      "certificates",
      `${student.enrollmentId}.jpeg`
    );

    const image = await loadImage(templatePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    // ✅ Draw the base image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // ✅ Format date to DD/MM/YYYY
    const date = new Date(student.date);
    const formattedDate = `${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()}`;

    ctx.fillStyle = "#000";
    ctx.font = "italic 22px DMSans";

    // ✅ Function to add letter spacing
    const drawTextWithSpacing = (text, x, y, spacing) => {
      let currentX = x;
      for (const char of text) {
        ctx.fillText(char, currentX, y);
        currentX += ctx.measureText(char).width + spacing; // Add spacing between characters
      }
    };

    // ✅ Draw text with letter spacing
    drawTextWithSpacing(`${student.certificateNo}`, 120, 310, 6);

    drawTextWithSpacing(`${student.enrollmentId}`, 760, 300, 6);

    const drawTextWithSpacingCentered = (text, y, spacing) => {
      let totalWidth = 0;
      for (const char of text) {
        totalWidth += ctx.measureText(char).width + spacing;
      }
      totalWidth -= spacing;

      const centerX = canvas.width / 2;
      const startX = centerX - totalWidth / 2;

      // Draw each character
      let currentX = startX;
      for (const char of text) {
        ctx.fillText(char, currentX, y);
        currentX += ctx.measureText(char).width + spacing;
      }
    };

    drawTextWithSpacingCentered(`${student.name}`, 760, 6);
    drawTextWithSpacingCentered(`${student.course}`, 910, 6);
    drawTextWithSpacingCentered(`${student.duration} Year`, 1065, 6);
    drawTextWithSpacingCentered(formattedDate, 1180, 6);

    return canvas.toBuffer("image/png");
  } catch (error) {
    console.error("Error generating certificate:", error);
    throw error;
  }
};
