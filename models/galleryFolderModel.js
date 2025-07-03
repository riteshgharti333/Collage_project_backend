import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    folderImage: {
      type: String,
      required: true,
    },
    folderTitle: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    galleryImages: [
      {
        imageUrl: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    folderImagePublicId: {
      type: String,
      required: true,
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const GalleryFolder = mongoose.model("GalleryFolder", gallerySchema);
