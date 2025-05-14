import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Contact } from "../models/contactModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import nodemailer from "nodemailer";

// CREATE CONTACT
export const createContact = catchAsyncError(async (req, res, next) => {
  const { name, email, phoneNumber, message } = req.body;

  if (!name || !email || !phoneNumber || !message) {
    throw new ErrorHandler("All fields are required!", 400);
  }

  const contact = await Contact.create({
    name,
    email,
    phoneNumber,
    message,
    approved: false,
  });

  res.status(201).json({
    result: 1,
    message: "Contact created successfully",
    contact,
  });
});

// GET ALL CONTACTS
export const getAllContacts = catchAsyncError(async (req, res, next) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });

  if (!contacts || contacts.length === 0) {
    throw new ErrorHandler("No contacts  found", 404);
  }

  res.status(200).json({
    result: 1,
    message: "Contacts fetched successfully",
    count: contacts.length,
    contacts,
  });
});

// GET SINGLE CONTACT BY ID
export const getContact = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const contact = await Contact.findById(id);

  if (!contact) {
    throw new ErrorHandler("Contact not found", 404);
  }

  res.status(200).json({
    result: 1,
    message: "Contact fetched successfully",
    contact,
  });
});

// DELETE CONTACT
export const deleteContact = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const contact = await Contact.findByIdAndDelete(id);

  if (!contact) {
    throw new ErrorHandler("Contact not found", 404);
  }

  res.status(200).json({
    result: 1,
    message: "Contact deleted successfully",
  });
});

// APPROVE CONTACT AND SEND EMAIL

export const approveContact = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const contact = await Contact.findById(id);

  if (!contact) {
    throw new ErrorHandler("Contact not found", 404);
  }

  if (contact.approved) {
    throw new ErrorHandler("Contact is already approved", 400);
  }

  // ✅ Mark as approved
  contact.approved = true;
  await contact.save();

  // ✅ Send email notification
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: contact.email,
    subject: "Contact Form Approved",
    html: `
      <h2>Contact Form Approved</h2>
      <p>Dear ${contact.name},</p>
      <p>Thank you for reaching out. We have received your message and will contact you soon.</p>
      <br/>
      <p>Best regards,</p>
      <p>International Academy Of Design</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      result: 1,
      message: "Contact approved and email sent successfully",
      contact,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new ErrorHandler("Failed to send email", 500);
  }
});
