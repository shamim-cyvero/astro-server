import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    razorpay_payment_id: {
      type: String,
      required: true,
    },
    razorpay_order_id: {
      type: String,
      required: true,
    },
    razorpay_signature: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
    },
    courseName: {
      type: String,
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
    },

    phone: {
      type: Number,
    },
 
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model("payment", paymentSchema);
