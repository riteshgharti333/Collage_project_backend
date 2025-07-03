import mongoose from "mongoose";

const homeContentSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const HomeContent = mongoose.model(
  "HomeContent",
  homeContentSchema
);
