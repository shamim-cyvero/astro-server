import { User } from "../models/user.model.js";
import { Contact } from "../models/contact.user.model.js";
import sendEmail from "../utils/sendEmail.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import cloudinary from "cloudinary";
import { Course } from "../models/course.model.js";

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
    const { name, email, phone, avatar } = req.body;
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
    if (avatar) {
      await cloudinary.v2.uploader.destroy(user.avatar.public_id, {
        folder: "astro",
      });
      const Myuploader = await cloudinary.v2.uploader.upload(avatar, {
        folder: "astro",
      });
      user.avatar.public_id = Myuploader.public_id;
      user.avatar.url = Myuploader.url;
    }

    await user.save({ validateBeforeSave: false });

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
    const subject = "Contact from smart property hub";
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

//----------- user enrolled in the course------------
export const UserEnrolledInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

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
    let existUser = await course.enrolledUser.id(user._id);
    if (existUser) {
      return res.status(400).json({
        success: false,
        message: "you already enrolled in this course",
      });
    }

    //here payment logic

    course.enrolledUser.push(req.user._id);
    user.course.push(course._id);
    await course.save({ validateBeforeSave: false });
    await user.save({ validateBeforeSave: false });

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

    let user = await User.findById(userId).populate("meeting", "name");
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
    await cloudinary.v2.uploader.destroy(user.avatar.public_id, {
      folder: "astro",
    });
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
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "name email phone required",
      });
    }

    let user = await Contact.create({ name, email, phone });

    res.status(200).json({
      success: true,
      message: "Message has been send",
      user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
