import { createCanvas, loadImage, registerFont } from "canvas";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url"; // Import this
import Marksheet from "../models/marksheetModel.js";
import ErrorHandler from "../utils/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontPath = path.join(__dirname, "..", "fonts", "Garet-Book.otf");

// Add a check to see if the font file is found at runtime
if (!fs.existsSync(fontPath)) {
  console.error(
    `FATAL: Font file not found at ${fontPath}. Current __dirname: ${__dirname}`
  );
  // You might want to throw an error here or have a fallback mechanism
  // For now, this log will be crucial for debugging on the server.
} else {
  registerFont(fontPath, {
    family: "Garet-Heavy", // This is the name you'll use in ctx.font
    weight: "normal",
    style: "normal",
  });
}

export const printMarksheet = async (id) => {
  try {
    const marksheet = await Marksheet.findById(id).populate("student");

    if (!marksheet) {
      throw new ErrorHandler(`No marksheet found with this ID: ${id}`, 404);
    }

    // ✅ Load base certificate image
    const templatePath = path.join("templates", "marksheet.jpg");
    const outputPath = path.join("certificates", `${id}.jpeg`);

    const image = await loadImage(templatePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    // ✅ Draw the base image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // ✅ Format date to DD/MM/YYYY
    const date = new Date(marksheet.date);
    const formattedDate = `${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()}`;

    ctx.fillStyle = "#000";
    ctx.font = "normal 22px 'Garet-Heavy'";

    // ✅ Function to add letter spacing
    const drawTextWithSpacing = (text, x, y, spacing) => {
      let currentX = x;
      for (const char of text) {
        ctx.fillText(char, currentX, y);
        currentX += ctx.measureText(char).width + spacing;
      }
    };

    ctx.fillText(`${marksheet.student.name}`, 250, 337);
    ctx.fillText(`${marksheet.student.fatherName}`, 234, 373);
    ctx.fillText(`${marksheet.student.course}`, 318, 408);

    //////////////////
    ctx.fillText(`${marksheet.student.duration}`, 648, 333);
    ctx.fillText(`${marksheet.student.enrollmentId}`, 760, 368);
    ctx.fillText(`${marksheet.student.certificateNo}`, 758, 405);

    marksheet.subjects.forEach((item, index) => {
      const baseY = 620;
      const lineHeight = 40;
      const y = baseY + index * lineHeight;

      drawTextWithSpacing(item.courseCode, 100, y, 4); // Adjust X for layout
      drawTextWithSpacing(item.courseName, 350, y, 4);
      drawTextWithSpacing(String(item.maxMarks), 680, y, 4);
      drawTextWithSpacing(String(item.obtainedMarks), 783, y, 4);
      drawTextWithSpacing(item.grade, 893, y, 4);
    });

    drawTextWithSpacing(`${marksheet.totalMaxMarks}`, 385, 1048, 6);
    drawTextWithSpacing(`${marksheet.totalObtainedMarks}`, 388, 1113, 6);
    drawTextWithSpacing(`${marksheet.overallGrade}`, 844, 1080, 6);

    return canvas.toBuffer("image/png");
  } catch (error) {
    console.error("Error generating certificate:", error);
    throw error;
  }
};
