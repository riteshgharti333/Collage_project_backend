import { ContactDetails } from "../models/contactDetailsModel.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";

// CREATE (only once)
export const createContactDetails = catchAsyncError(async (req, res, next) => {
  const { phoneNumber, email, address, facebookLink, instagramLink } = req.body;

  if (!phoneNumber || !email || !address) {
    throw new ErrorHandler("Phone number, email, and address are required", 400);
  }

  const exists = await ContactDetails.findOne();
  if (exists) {
    throw new ErrorHandler("Contact details already exist. Use update instead.", 400);
  }

  const contact = await ContactDetails.create({
    phoneNumber,
    email,
    address,
    facebookLink,
    instagramLink,
  });

  res.status(201).json({
    success: true,
    message: "Contact details created successfully",
    contact,
  });
});

// GET only one
export const getContactDetails = catchAsyncError(async (req, res, next) => {
  const contact = await ContactDetails.findOne();

  if (!contact) {
    throw new ErrorHandler("Contact details not found", 404);
  }

  res.status(200).json({
    success: true,
    contact,
  });
});

// UPDATE the only one
export const updateContactDetails = catchAsyncError(async (req, res, next) => {
  const {
    phoneNumber,
    email,
    address,
    facebookLink,
    instagramLink,
  } = req.body;

  const contact = await ContactDetails.findOne();
  if (!contact) {
    throw new ErrorHandler("No contact details to update", 404);
  }

  if (phoneNumber) contact.phoneNumber = phoneNumber;
  if (email) contact.email = email;
  if (address) contact.address = address;
  if (facebookLink) contact.facebookLink = facebookLink;
  if (instagramLink) contact.instagramLink = instagramLink;

  await contact.save();

  res.status(200).json({
    success: true,
    message: "Contact details updated successfully",
    contact,
  });
});
