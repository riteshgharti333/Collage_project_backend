import mongoose from "mongoose";

const founderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Founder = mongoose.model("Founder", founderSchema);
