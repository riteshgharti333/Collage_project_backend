import mongoose from "mongoose";

const contactDetailsSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    facebookLink: {
      type: String,
      default: "",
      trim: true,
    },
    instagramLink: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

export const ContactDetails = mongoose.model(
  "ContactDetails",
  contactDetailsSchema
);
