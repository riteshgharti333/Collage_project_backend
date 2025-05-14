import mongoose from "mongoose";

const affiliatedImageSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const AffiliatedImage = mongoose.model(
  "AffiliatedImage",
  affiliatedImageSchema
);
