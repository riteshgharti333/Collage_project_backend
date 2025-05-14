import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    images: {
      type: [
        {
          img: { type: String, required: true },
        },
      ],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export const Gallery = mongoose.model("Gallery", gallerySchema);
