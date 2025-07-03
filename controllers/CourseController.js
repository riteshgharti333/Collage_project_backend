import cloudinary from "../utils/cloudinary.js";
import Course from "../models/courseModel.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import streamifier from "streamifier";
import mongoose from "mongoose";

// CREATE COURSE

export const createCourse = catchAsyncError(async (req, res, next) => {
  console.log("first");
  const {
    bannerTitle,
    courseType,
    courseTitle,
    courseDescription,
    courseOfCoursesTitle,
    courseOfCoursesLists,
    topicTitle,
    topicLists,
    careerTitle,
    careerLists,
    courseListTitle,
    courseListDesc,
    courseLists,
    overviewTitle,
    overviewDesc,
  } = req.body;

  const bannerFile = req.files?.bannerImage?.[0];
  const smFile = req.files?.smCourseImage?.[0];

  if (!bannerFile) {
    return next(new ErrorHandler("Banner image is required", 400));
  }

  // Upload banner image
  let bannerImageUrl;
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "thenad_data/course_banners",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(bannerFile.buffer).pipe(stream);
    });
    bannerImageUrl = result.secure_url;
  } catch (error) {
    console.error("Banner Upload Error:", error);
    throw new ErrorHandler("Failed to upload banner image", 500);
  }

  // Upload smCourseImage (optional)
  let smImageUrl;
  if (smFile) {
    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "thenad_data/courseSmImgs",
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(smFile.buffer).pipe(stream);
      });
      smImageUrl = result.secure_url;
    } catch (error) {
      console.error("smCourseImage Upload Error:", error);
      throw new ErrorHandler("Failed to upload smCourseImage", 500);
    }
  }

  // Parse stringified arrays

  let parsedCourseLists,
    parsedCourseOfCourses,
    parsedTopicLists,
    parsedCareerLists;
  try {
    parsedCourseLists = JSON.parse(courseLists);
    if (!Array.isArray(parsedCourseLists))
      throw new Error("courseLists is not an array");

    parsedCourseOfCourses = JSON.parse(courseOfCoursesLists);
    if (!Array.isArray(parsedCourseOfCourses))
      throw new Error("courseOfCoursesLists is not an array");

    parsedTopicLists = JSON.parse(topicLists);
    if (!Array.isArray(parsedTopicLists))
      throw new Error("topicLists is not an array");

    parsedCareerLists = JSON.parse(careerLists);
    if (!Array.isArray(parsedCareerLists))
      throw new Error("careerLists is not an array");
  } catch (error) {
    throw new ErrorHandler(
      "Invalid format for one or more lists. Must be JSON arrays.",
      400
    );
  }

  const course = await Course.create({
    bannerTitle,
    bannerImage: bannerImageUrl,
    smCourseImage: smImageUrl,
    courseType,
    courseTitle,
    courseDescription,
    courseOfCoursesTitle,
    courseOfCoursesLists: parsedCourseOfCourses,
    topicTitle,
    topicLists: parsedTopicLists,
    careerTitle,
    careerLists: parsedCareerLists,
    courseListTitle,
    courseListDesc,
    courseLists: parsedCourseLists,
    overviewTitle,
    overviewDesc,
  });

  res.status(201).json({
    success: true,
    message: "Course created successfully",
    course,
  });
});

// GET ALL COURSES
export const getAllCourses = catchAsyncError(async (req, res, next) => {
  const courses = await Course.find().sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    count: courses.length,
    courses,
  });
});

// GET SINGLE COURSE
export const getCourseById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    throw new ErrorHandler("Course ID is required", 400);
  }

  const course = await Course.findById(id);

  if (!course) {
    throw new ErrorHandler("Course not found", 404);
  }

  res.status(200).json({
    success: true,
    course,
  });
});

// DELETE COURSE
export const deleteCourse = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorHandler("Invalid ID format!", 400);
  }

  const course = await Course.findById(id);

  if (!course) {
    throw new ErrorHandler("Course not found!", 404);
  }

  // Delete bannerImage from Cloudinary
  const bannerUrl = course.bannerImage;
  if (bannerUrl) {
    const bannerPublicId = bannerUrl.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(
      `thenad_data/course_banners/${bannerPublicId}`
    );
  }

  // Delete smCourseImage from Cloudinary
  const smImageUrl = course.smCourseImage;
  if (smImageUrl) {
    const smPublicId = smImageUrl.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`thenad_data/courseSmImgs/${smPublicId}`);
  }

  // Delete course from MongoDB
  await course.deleteOne();

  res.status(200).json({
    result: 1,
    message: "Course deleted successfully!",
  });
});

// UPDATE COURSE
export const updateCourse = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const {
    bannerTitle,
    courseType,
    courseTitle,
    courseDescription,
    courseOfCoursesTitle,
    courseOfCoursesLists,
    topicTitle,
    topicLists,
    careerTitle,
    careerLists,
    courseListTitle,
    courseListDesc,
    courseLists,
    overviewTitle,
    overviewDesc,
  } = req.body;

  const course = await Course.findById(id);
  if (!course) {
    throw new ErrorHandler("Course not found!", 404);
  }

  const bannerFile = req.files?.bannerImage?.[0];
  const smFile = req.files?.smCourseImage?.[0];

  // === Update bannerImage ===
  let bannerImageUrl = course.bannerImage;
  if (bannerFile) {
    try {
      const oldBannerId = course.bannerImage.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(
        `thenad_data/course_banners/${oldBannerId}`
      );

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "thenad_data/course_banners",
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(bannerFile.buffer).pipe(stream);
      });

      bannerImageUrl = result.secure_url;
    } catch (error) {
      console.error("Banner Upload Error:", error);
      throw new ErrorHandler("Failed to upload banner image", 500);
    }
  }

  // === Update smCourseImage ===
  let smImageUrl = course.smCourseImage;
  if (smFile) {
    try {
      if (course.smCourseImage) {
        const oldSmId = course.smCourseImage.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(
          `thenad_data/courseSmImgs/${oldSmId}`
        );
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "thenad_data/courseSmImgs",
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(smFile.buffer).pipe(stream);
      });

      smImageUrl = result.secure_url;
    } catch (error) {
      console.error("smCourseImage Upload Error:", error);
      throw new ErrorHandler("Failed to upload smCourseImage", 500);
    }
  }

  // === Parse list fields if provided ===
  let parsedCourseLists = course.courseLists;
  let parsedCourseOfCourses = course.courseOfCoursesLists;
  let parsedTopicLists = course.topicLists;
  let parsedCareerLists = course.careerLists;

  try {
    if (courseLists) {
      parsedCourseLists = JSON.parse(courseLists);
      if (!Array.isArray(parsedCourseLists))
        throw new Error("courseLists must be an array");
    }
    if (courseOfCoursesLists) {
      parsedCourseOfCourses = JSON.parse(courseOfCoursesLists);
      if (!Array.isArray(parsedCourseOfCourses))
        throw new Error("courseOfCoursesLists must be an array");
    }
    if (topicLists) {
      parsedTopicLists = JSON.parse(topicLists);
      if (!Array.isArray(parsedTopicLists))
        throw new Error("topicLists must be an array");
    }
    if (careerLists) {
      parsedCareerLists = JSON.parse(careerLists);
      if (!Array.isArray(parsedCareerLists))
        throw new Error("careerLists must be an array");
    }
  } catch (error) {
    throw new ErrorHandler(
      "Invalid format for one or more lists. Must be JSON arrays.",
      400
    );
  }

  // === Update course fields ===
  course.bannerTitle = bannerTitle || course.bannerTitle;
  course.bannerImage = bannerImageUrl;
  course.smCourseImage = smImageUrl;
  course.courseType = courseType || course.courseType;
  course.courseTitle = courseTitle || course.courseTitle;
  course.courseDescription = courseDescription || course.courseDescription;
  course.courseOfCoursesTitle =
    courseOfCoursesTitle || course.courseOfCoursesTitle;
  course.courseOfCoursesLists = parsedCourseOfCourses;
  course.topicTitle = topicTitle || course.topicTitle;
  course.topicLists = parsedTopicLists;
  course.careerTitle = careerTitle || course.careerTitle;
  course.careerLists = parsedCareerLists;
  course.courseListTitle = courseListTitle || course.courseListTitle;
  course.courseListDesc = courseListDesc || course.courseListDesc;
  course.courseLists = parsedCourseLists;
  course.overviewTitle = overviewTitle || course.overviewTitle;
  course.overviewDesc = overviewDesc || course.overviewDesc;

  await course.save();

  res.status(200).json({
    success: true,
    message: "Course updated successfully",
    course,
  });
});
