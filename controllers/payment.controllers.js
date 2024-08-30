import crypto from "crypto";
import { instance } from "../server.js";
import { Payment } from "../models/payment.model.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";

export const Getkey = async (req, res) => {
  try {
    res.status(200).json({
      key: process.env.RAZORPAY_API_KEY,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const PaymentProcess = async (req, res) => {
  try {
    const { price } = req.body;

    const options = {
      amount: Number(price * 100),
      currency: "INR",
    };

    let order = await instance.orders.create(options);

    res.status(201).json({
      success: true,
      message: "order has created",
      order,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      message: "created error",
    });
  }
};

export const PaymentVerfication = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    const { courseId } = req.params;
    let user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Time-Out Please! Login",
      });
    }

    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({
        success: false,
        message: "course not found",
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      await Payment.create({
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      });
      const data = {
        payment_id: razorpay_payment_id,
        date: Date(Date.now()),
        courseId: course._id,
      };
      user.course.push(data);

      const data2 = {
        payment_id: razorpay_payment_id,
        date: Date(Date.now()),
        user: user._id,
      };
      course.enrolledUsers.push(data2);
      user.res.redirect(
        `http://localhost:5173/paymentsuccess?refrence=${razorpay_payment_id}`
      );
    } else {
      res.status(400).json({
        success: false,
        message: "something went wrong",
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
