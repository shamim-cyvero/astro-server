import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name field required"],
      minLength: [4, "name must have four character"],
      trim: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: [true, "email field required"],
      unique: true,
    },

    phone: {
      type: Number,
      required: [true, "phone field required"],
    },
  },
  {
    timestamps: true,
  }
);

export const Contact = mongoose.model("contact", contactSchema);
