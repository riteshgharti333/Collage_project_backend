import mongoose from "mongoose";
import bcrypt from "bcrypt";

const authSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      validate: {
        validator: function (v) {
          return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
        },
        message: "Please provide a valid email address",
      },
    },
    password: {
      type: String,
      select: false,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      validate: {
        validator: function (v) {
          return v.length >= 8;
        },
        message: "Password must be at least 8 characters long",
      },
    },
  },
  { timestamps: true },
);

// 🔹 Hash password before saving to the database
authSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // 🔹 Ensure we are not hashing an already hashed password
  if (!this.password.startsWith("$2b$")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

// 🔁 Update password method (length-only validation)
authSchema.methods.updatePassword = async function (newPassword) {
  if (newPassword.length < 8) {
    throw new Error("New Password must be at least 8 characters long.");
  }

  this.password = await bcrypt.hash(newPassword, 10);

  try {
    await this.save({ validateBeforeSave: true });
  } catch (error) {
    throw new Error(`Validation failed: ${error.message}`);
  }

  return this.password;
};

export const Auth = mongoose.model("Auth", authSchema);
