import mongoose from "mongoose";

const homeContentDetailsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const HomeContentDetails = mongoose.model(
  "HomeContentDetails",
  homeContentDetailsSchema
);
