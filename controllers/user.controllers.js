import { User } from "../models/user.model.js";
import { Contact } from "../models/contact.user.model.js";
import sendEmail from "../utils/sendEmail.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import cloudinary from "cloudinary";
import { Course } from "../models/course.model.js";
import Razorpay from "razorpay";
import { Astrologer } from "../models/astrologer.model.js";
import { UserAndEnrolledUser } from "../models/userAndEnrolledUser.model.js";

export const UserSignup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "Your have done Registration. Please Login",
      });
    }

    const hasPassword = await bcrypt.hash(password, 10);
    user = await User.create({
      name,
      email,
      phone,
      password: hasPassword,
    });
    const token = jwt.sign({ _id: user._id }, process.env.JWT);

    res
      .status(201)
      .cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 60 * 1000),
        sameSite: "none",
        secure: true,
      })
      .json({
        success: true,
        message: "Registration has completed",
        user,
      });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const UserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email and Password Invalid. Try Again",
      });
    }

    const verify = await bcrypt.compare(password, user.password);
    if (!verify) {
      return res.status(400).json({
        success: false,
        message: "Email and Password Invalid. Try Again",
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT);

    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 60 * 1000),
        sameSite: "none",
        secure: true,
      })
      .json({
        success: true,
        message: `Welcome ${user.name}`,
        user,
      });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const UserLogout = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .json({
        success: true,
        message: "Logout Done",
        // user: req.user, 15-12-23
      });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const UserProfile = async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Time-Out Please! Login",
      });
    }
    res.status(201).json({
      success: true,
      message: "user load Success",
      user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const UserUpdateProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    let user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Time-Out Please! Login",
      });
    }
    if (name) {
      user.name = name;
    }
    if (email) {
      user.email = email;
    }
    if (phone) {
      user.phone = phone;
    }
    if (address) {
      user.address = address;
    }

    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: "user updated Success",
      user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const UserUpdateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    let user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Time-Out Please! Login",
      });
    }

    if (avatar) {
      if (user.avatar.public_id) {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id, {
          folder: "astro",
        });
      }
      const Myuploader = await cloudinary.v2.uploader.upload(avatar, {
        folder: "astro",
      });
      user.avatar.public_id = Myuploader.public_id;
      user.avatar.url = Myuploader.url;
    }

    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: "user avatar change Success",
      user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const UserForgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email not Found Please! do Registration",
      });
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    user.save({ validateBeforeSave: false });

    const subject = "Re-Set Your Password";
    const url = `${process.env.FRONTEND_URL}/api/v1/user/reset/password/${resetToken}`;
    const message = `Welcome sir/mam\n This is Your Re-Set Password Link - ${url}\n if Already Re-Set so, you can ignore`;
    sendEmail(subject, email, message);

    res.status(200).json({
      success: true,
      message: `Forget Password Link has been send to : ${email}`,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const UserResetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    let user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token has been Expires",
      });
    }

    const hasPassword = await bcrypt.hash(password, 10);
    user.password = hasPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `Password has been change of ${user.name}`,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const EmailContact = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required",
      });
    }
    const subject = "Contact from  astrosoull";
    const UserEmail = process.env.SMTP_SENDER_EMAIL;
    const message = `Hi, My Email is ${email}`;
    sendEmail(subject, UserEmail, message);

    res.status(200).json({
      success: true,
      message: "Message has been send",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ----------------admin controllers -----------------------

export const AdminGetAllUser = async (req, res) => {
  try {
    let user = await User.find();
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Sorry Admin - user not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const AdminGetSingleUser = async (req, res) => {
  try {
    const { userId } = req.params;

    let user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Sorry Admin - user not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const AdminDeleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    let user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Sorry Admin - user is not in our DataBase",
      });
    }
    if (user.avatar?.public_id) {
      await cloudinary.v2.uploader.destroy(user.avatar?.public_id, {
        folder: "astro",
      });
    }
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "user has been delete",
      user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

//----------- user contact model------------
export const UserContact = async (req, res) => {
  try {
    const { name, email, phone, message, subject } = req.body;
    if (!name || !email || !phone || !message || !subject) {
      return res.status(400).json({
        success: false,
        message: "all input required",
      });
    }

    await Contact.create({ name, email, phone, message, subject });

    res.status(200).json({
      success: true,
      message: "Message has been send",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

//----------- user enrolled in the course------------
export const UserEnrolledInCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Course not found",
      });
    }
    let user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Time-Out Please! Login",
      });
    }
    let isEnrolled = false;
    isEnrolled = course.enrolledUsers.some(
      (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (isEnrolled) {
      return res.status(400).json({
        isEnrolled,
        message: `${user.name} is already enrolled in this course`,
      });
    } else {
      return res.status(400).json({
        isEnrolled,
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

//----------------payment for meeting---------------------

export const PaymentGetkeyMeeting = async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Time-Out Please! Login",
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

export const MeetingPaymentProcess = async (req, res) => {
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

export const MeetingPaymentVerfication = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;
    const { price, duration, date, time } = req.query;
    const { astrologerId } = req.params;

    let astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer) {
      return res.status(400).json({
        success: false,
        message: "astrologer not found",
      });
    }

    let user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Time-Out Please! Login",
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      const data = {
        user: user._id,
        userName: user.name,
        userAvatar: user.avatar.url,
        duration: duration,
        date: date,
        time: time,
        price: price,

        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      };
      astrologer.meeting.push(data);

      const data2 = {
        astrologer: astrologer._id,
        astrologerName: astrologer.name,
        astrologerAvatar: astrologer.avatar.url,
        duration: duration,
        date: date,
        time: time,
        price: price,
        payment_id: razorpay_payment_id,
      };
      user.meeting.push(data2);

      await astrologer.save({ validateBeforeSave: false });
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

export const GetUserAndEnrolledUserData = async (req, res) => {
  try {
    const stats = await UserAndEnrolledUser.find({})
      .sort({ createdAt: "desc" })
      .limit(12);

    const statsData = [];

    for (let i = 0; i < stats.length; i++) {
      statsData.unshift(stats[i]);
    }

    const requiredSize = 12 - stats.length;
    for (let i = 0; i < requiredSize; i++) {
      statsData.unshift({
        users: 0,
        enrolledUsers: 0,
      });
    }

    const usersCount = statsData[11].users;
    const enrolledUsersCount = statsData[11].enrolledUsers;

    let usersPercentage = 0;
    let enrolledUsersPercentage = 0;

    let usersProfit = true;
    let enrolledUsersProfit = true;

    if (statsData[10].users === 0) usersPercentage = usersCount * 100;
    if (statsData[10].enrolledUsers === 0)
      enrolledUsersPercentage = enrolledUsersCount * 100;
    else {
      const difference = {
        users: statsData[11].users - statsData[10].users,
        enrolledUsers:
          statsData[11].enrolledUsers - statsData[10].enrolledUsers,
      };

      usersPercentage = (difference.users / statsData[10].users) * 100;
      enrolledUsersPercentage =
        (difference.enrolledUsers / statsData[10].enrolledUsers) * 100;

      if (usersPercentage < 0) usersProfit = false;
      if (enrolledUsersPercentage < 0) enrolledUsersProfit = false;
    }

    res.status(200).json({
      success: true,
      message: "data has been send",
      statsData, //complete year data

      //specific/last month data
      usersCount,
      enrolledUsersCount,

      usersPercentage,
      enrolledUsersPercentage,
      usersProfit,
      enrolledUsersProfit,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// User.watch().on("change", async () => {
//   const stats = await UserAndEnrolledUser.find({})
//     .sort({ createdAt: "desc" })
//     .limit(1);

//   const enrolledUserscount = await User.countDocuments({
//     "course.0": { $exists: true }, // Checks if there is at least one course in the array
//   });

//   stats[0].users = await User.countDocuments();
//   stats[0].enrolledUsers = enrolledUserscount;

//   await stats[0].save({ validateBeforeSave: false });
// });

User.watch().on("change", async (change) => {
  try {
    // Watch specific types of operations if necessary (e.g., 'insert', 'update')
    if (change.operationType === 'insert' || change.operationType === 'update') {
      
      // Fetch the most recent document from the UserAndEnrolledUser collection
      const stats = await UserAndEnrolledUser.find({})
        .sort({ createdAt: "desc" })
        .limit(1);

      // Count users with at least one course
      const enrolledUsersCount = await User.countDocuments({
        "course.0": { $exists: true }, // Checks if there is at least one course in the array
      });

      // Update the statistics in the most recent stats document
      if (stats.length > 0) {
        stats[0].users = await User.countDocuments(); // Total number of users
        stats[0].enrolledUsers = enrolledUsersCount; // Number of enrolled users

        // Save the updated stats document without validation
        await stats[0].save({ validateBeforeSave: false });
      }
    }
  } catch (error) {
    console.error("Error updating stats:", error);
  }
});

