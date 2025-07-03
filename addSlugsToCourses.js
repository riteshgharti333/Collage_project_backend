import mongoose from "mongoose";
import slugify from "slugify";
import Course from "./models/courseModel.js"; // Adjust the path if needed
import dotenv, { config } from "dotenv";

config({
  path: "./data/config.env",
});

async function addSlugs() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);

    const courses = await Course.find({ slug: { $exists: false } }); // Find courses missing slug

    for (const course of courses) {
      course.slug = slugify(course.courseTitle, {
        lower: true,
        strict: true,
      });

      await course.save();
      console.log(`Slug added for course: ${course.courseTitle} -> ${course.slug}`);
    }

    console.log("All courses updated with slugs.");
    process.exit(0);
  } catch (error) {
    console.error("Error adding slugs:", error);
    process.exit(1);
  }
}

addSlugs();
