import crypto from "crypto";
import Razorpay from "razorpay";
import { Payment } from "../models/payment.model.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";

export const Getkey = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Check if user exists
    let user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Time-Out Please! Login",
      });
    }

    // Check if course exists
    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is already enrolled
    const isEnrolled = course.enrolledUsers.some((rev) => rev.user.toString() === req.user._id.toString());

    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        message: `${user.name} is already enrolled in this course`,
      });
    }

    // If not enrolled, return the payment key
    return res.status(200).json({
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

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_API_KEY,
      key_secret: process.env.RAZORPAY_API_SECRET,
    });

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
    console.log(isAuthentic);

    if (isAuthentic) {
      await Payment.create({
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,

        courseId: courseId,
        price: course.price,
        courseName: course.name,

        user: user._id,
        userName: user.name,
        email: user.email,
        phone: user.phone,
      });
      const data = {
        payment_id: razorpay_payment_id,
        date: Date(Date.now()),
        courseId: course._id,
        name: course.name,
        price: course.price,
      };
      user.course.push(data);

      const data2 = {
        payment_id: razorpay_payment_id,
        date: Date(Date.now()),
        user: user._id,
        name: user.name,
        price: course.price,
        email: user.email,
        phone: user.phone,
      };
      course.enrolledUsers.push(data2);

      await course.save({ validateBeforeSave: false });
      await user.save({ validateBeforeSave: false });

      res.redirect(
        `http://localhost:5173/paymentsuccess?refrence=${razorpay_payment_id}`
      );
      // res.status(200).json({
      //   success: true,
      //   message: "payment success",
      // });
    } else {
      return res.status(400).json({
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

export const AdminGetAllTransaction = async (req, res) => {
  try {
    const payments = await Payment.find();
    if (!payments || payments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No payments found",
      });
    }

    // Calculate total earnings by summing the price of all payments
    // const totalEarnings = payments.reduce((total, payment) => {
    //   return total + payment.price;
    // }, 0);

    let totalEarnings = 0;
    payments.forEach((rev) => {
      totalEarnings += rev.price;
    });

    res.status(200).json({
      success: true,
      totalEarnings,
      payments,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
