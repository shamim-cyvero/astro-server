import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name field required"],
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
    message: {
      type: String,
      required: [true, "name field required"],
    },
    subject: {
      type: String,
      required: [true, "name field required"],
    },
  },
  {
    timestamps: true,
  }
);

export const Contact = mongoose.model("contact", contactSchema);
