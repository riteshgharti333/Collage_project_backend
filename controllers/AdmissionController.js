import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Admission } from "../models/admissionModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import nodemailer from "nodemailer";
import streamifier from "streamifier";
import mongoose from "mongoose";
import cloudinary from "../utils/cloudinary.js";

// NEW ADMISSION

export const createAdmission = catchAsyncError(async (req, res, next) => {
  const {
    name,
    email,
    phoneNumber,
    profile,
    selectCourse,
    selectState,
    district,
    city,
    message,
  } = req.body;

  // Check required fields
  if (
    !name ||
    !email ||
    !phoneNumber ||
    !profile ||
    !selectCourse ||
    !selectState ||
    !district ||
    !city
  ) {
    return next(new ErrorHandler("All fields are required!", 400));
  }

  let imageUrl = null;
  try {
    const profilePhoto = req.files.photo[0];
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "thenad_data/admissions/profile_photos",
          transformation: [
            { width: 300, height: 300, crop: "fill", quality: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      streamifier.createReadStream(profilePhoto.buffer).pipe(stream);
    });

    imageUrl = result.secure_url;
  } catch (error) {
    console.error("Profile photo upload error:", error);
    return next(new ErrorHandler("Failed to upload profile photo", 500));
  }

  let documentUrls = [];
  if (req.files.document && req.files.document.length > 0) {
    try {
      // Process all documents in parallel
      const uploadPromises = req.files.document.map((file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "thenad_data/admissions/documents",
              resource_type: "auto",
              type: "upload",
              access_mode: "public",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );

          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      });

      documentUrls = await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Document upload error:", error);
      return next(new ErrorHandler("Failed to upload some documents", 500));
    }
  }

  // Create admission record
  const admission = await Admission.create({
    name,
    email,
    phoneNumber,
    profile,
    selectCourse,
    selectState,
    district,
    city,
    message: message || "",
    photo: imageUrl,
    document: documentUrls,
    status: "pending",
  });

  res.status(201).json({
    success: true,
    message: "Admission submitted successfully",
    admission,
  });
});

// GET ALL ADMISSIONS
export const getAllAdmissions = catchAsyncError(async (req, res, next) => {
  const admissions = await Admission.find();

  if (!admissions || admissions.length === 0) {
    return next(new ErrorHandler("No admissions form found", 404));
  }

  res.status(200).json({
    result: 1,
    message: "Admissions fetched successfully",
    count: admissions.length,
    admissions,
  });
});

// GET SINGLE ADMISSION BY ID

export const getAdmissionById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const admission = await Admission.findById(id);

  if (!admission) {
    return next(new ErrorHandler("Admission not found", 404));
  }

  res.status(200).json({
    result: 1,
    message: "Admission fetched successfully",
    admission,
  });
});

// DELETE ADMISSION BY ID

export const deleteAdmission = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  // Find the admission record first
  const admission = await Admission.findById(id);
  if (!admission) {
    return next(new ErrorHandler("Admission not found", 404));
  }

  try {
    // Delete profile photo from Cloudinary if it exists
    if (admission.photo) {
      const publicId = admission.photo
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];
      await cloudinary.uploader.destroy(
        `thenad_data/admissions/profile_photos/${publicId}`
      );
    }

    // Delete all documents from Cloudinary if they exist
    if (admission.document && admission.document.length > 0) {
      const deletePromises = admission.document.map((docUrl) => {
        const publicId = docUrl.split("/").slice(-2).join("/").split(".")[0];
        return cloudinary.uploader.destroy(
          `thenad_data/admissions/documents/${publicId}`,
          {
            resource_type: "raw",
          }
        );
      });
      await Promise.all(deletePromises);
    }

    // Delete the admission record from database
    await Admission.findByIdAndDelete(id);

    res.status(200).json({
      result: 1,
      message: "Admission deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting admission:", error);
    return next(new ErrorHandler("Failed to delete admission", 500));
  }
});

// ADDMISSION APPROVED

export const approveAdmission = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const admission = await Admission.findById(id);

  if (!admission) {
    throw new ErrorHandler("Admission not found", 404);
  }

  if (admission.approved) {
    return res.status(400).json({
      result: 0,
      message: "Admission is already approved.",
    });
  }

  // ✅ Mark as approved
  admission.approved = true;
  await admission.save();

  // ✅ Send confirmation email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: admission.email,
    subject: "Admission Approved",
    html: `
      <h2>Admission Approved</h2>
      <p>Dear ${admission.name},</p>
      <p>Congratulations! Your admission form has been approved.</p>
      <p>Course: <strong>${admission.selectCourse}</strong></p>
      <p>State: <strong>${admission.selectState}</strong></p>
      <p>District: <strong>${admission.district}</strong></p>
      <p>City: <strong>${admission.city}</strong></p>
      <br/>
      <p>We will contact you soon with further details.</p>
      <br/>
      <p>Best regards,</p>
      <p>International Academy Of Design</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      result: 1,
      message: "Admission approved and email sent successfully",
      admission,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new ErrorHandler("Failed to send email", 500);
  }
});

///////////////////////////

const deleteFromCloudinary = async (publicUrl) => {
  try {
    if (!publicUrl) return;

    // Extract public_id from the URL
    const publicId = publicUrl.split("/").pop().split(".")[0];
    const folder = publicUrl.split("/").slice(-2, -1)[0]; // Extracts folder name

    await cloudinary.uploader.destroy(`${folder}/${publicId}`, {
      resource_type: publicUrl.includes(".pdf") ? "raw" : "image",
    });
  } catch (error) {
    console.error("Failed to delete from Cloudinary:", error);
    throw error;
  }
};

export const updateAdmission = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  // Find the existing admission record
  const existingAdmission = await Admission.findById(id);
  if (!existingAdmission) {
    return next(new ErrorHandler("Admission record not found", 404));
  }

  let newImageUrl = existingAdmission.photo;
  let newDocumentUrls = existingAdmission.document;

  // Handle profile photo update (if new photo is provided)
  if (req.files?.photo?.[0]) {
    try {
      const profilePhoto = req.files.photo[0];

      // Validate image type and size
      const allowedImageTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
      ];
      if (!allowedImageTypes.includes(profilePhoto.mimetype)) {
        return next(
          new ErrorHandler(
            "Only JPEG/PNG/JPG/WEBP images are allowed for profile photo",
            400
          )
        );
      }
      if (profilePhoto.size > 5 * 1024 * 1024) {
        return next(
          new ErrorHandler("Profile photo must be less than 5MB", 400)
        );
      }

      // Upload new photo
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "thenad_data/admissions/profile_photos",
            transformation: [
              { width: 300, height: 300, crop: "fill", quality: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(profilePhoto.buffer).pipe(stream);
      });

      newImageUrl = result.secure_url;

      // Delete old photo from Cloudinary
      if (existingAdmission.photo) {
        await deleteFromCloudinary(existingAdmission.photo);
      }
    } catch (error) {
      console.error("Profile photo update error:", error);
      return next(new ErrorHandler("Failed to update profile photo", 500));
    }
  }

  // Handle document updates (if new documents are provided)
  if (req.files?.document?.length > 0) {
    try {
      // Validate new documents
      for (const file of req.files.document) {
        if (file.mimetype !== "application/pdf") {
          return next(new ErrorHandler("Documents must be PDF files", 400));
        }
        if (file.size > 10 * 1024 * 1024) {
          return next(
            new ErrorHandler("Each document must be less than 10MB", 400)
          );
        }
      }

      // Upload new documents
      const uploadPromises = req.files.document.map((file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "thenad_data/admissions/documents",
              resource_type: "auto",
              type: "upload",
              access_mode: "public",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      });

      newDocumentUrls = await Promise.all(uploadPromises);

      // Delete old documents from Cloudinary
      if (existingAdmission.document?.length > 0) {
        await Promise.all(existingAdmission.document.map(deleteFromCloudinary));
      }
    } catch (error) {
      console.error("Document update error:", error);
      return next(new ErrorHandler("Failed to update documents", 500));
    }
  }

  // Update the admission record
  const updatedAdmission = await Admission.findByIdAndUpdate(
    id,
    {
      ...updates,
      photo: newImageUrl,
      document: newDocumentUrls,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Admission updated successfully",
    admission: updatedAdmission,
  });
});
