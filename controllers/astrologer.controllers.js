import { Astrologer } from "../models/astrologer.model.js";
import sendEmail from "../utils/sendEmail.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import cloudinary from "cloudinary";
import { User } from "../models/user.model.js";

export const AstrologerSignup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    let astrologer = await Astrologer.findOne({ email });
    if (astrologer) {
      return res.status(400).json({
        success: false,
        message: "Your have done Registration. Please Login",
      });
    }

    const hasPassword = await bcrypt.hash(password, 10);
    astrologer = await Astrologer.create({
      name,
      email,
      phone,
      password: hasPassword,
    });
    const token = jwt.sign({ _id: astrologer._id }, process.env.JWT);

    res
      .status(201)
      .cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 60 * 1000),
        sameSite:"none",
        secure:true,
      })
      .json({
        success: true,
        message: "Registration has completed",
        astrologer,
      });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const AstrologerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    let astrologer = await Astrologer.findOne({ email }).select("+password");
    if (!astrologer) {
      return res.status(400).json({
        success: false,
        message: "Email and Password Invalid. Try Again",
      });
    }

    const verify = await bcrypt.compare(password, astrologer.password);
    if (!verify) {
      return res.status(400).json({
        success: false,
        message: "Email and Password Invalid. Try Again",
      });
    }

    const token = jwt.sign({ _id: astrologer._id }, process.env.JWT);

    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 60 * 1000),
        sameSite:"none",
        secure:true,
      })
      .json({
        success: true,
        message: `Welcome ${astrologer.name}`,
        astrologer,
      });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const AstrologerLogout = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,

        sameSite:"none",
        secure:true,
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

export const AstrologerProfile = async (req, res) => {
  try {
    let astrologer = await Astrologer.findById(req.user._id);
    if (!astrologer) {
      return res.status(400).json({
        success: false,
        message: "Time-Out Please! Login",
      });
    }
    res.status(201).json({
      success: true,
      message: "astrologer load Success",
      astrologer,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const AstrologerUpdateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      avatar,
      address,
      about,
      chargePerMin,
      expert,
      language,
    } = req.body;
    let astrologer = await Astrologer.findById(req.user._id);
    if (!astrologer) {
      return res.status(400).json({
        success: false,
        message: "Time-Out Please! Login",
      });
    }
    if (name) astrologer.name = name;
    if (email) astrologer.email = email;
    if (phone) astrologer.phone = phone;
    if (address) astrologer.address = address;
    if (expert) astrologer.expert = expert;

    if (about) astrologer.about = about;
    // if (education) astrologer.education.push(education);
    // if (experience) astrologer.experience.push(experience);
    if (chargePerMin) astrologer.chargePerMin = chargePerMin;
    if (language) astrologer.language = language;
    if (avatar) {
      await cloudinary.v2.uploader.destroy(astrologer.avatar.public_id, {
        folder: "astro",
      });
      const Myuploader = await cloudinary.v2.uploader.upload(avatar, {
        folder: "astro",
      });
      astrologer.avatar.public_id = Myuploader.public_id;
      astrologer.avatar.url = Myuploader.url;
    }

    await astrologer.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: " update astrologer Success",
      astrologer,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const AstrologeUpdateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    let astrologer = await Astrologer.findById(req.user._id);
    if (!astrologer) {
      return res.status(400).json({
        success: false,
        message: "Time-Out Please! Login",
      });
    }

    if (avatar) {
      if (astrologer.avatar.public_id) {
        await cloudinary.v2.uploader.destroy(astrologer.avatar.public_id, {
          folder: "astro",
        });
      }
      const Myuploader = await cloudinary.v2.uploader.upload(avatar, {
        folder: "astro",
      });
      astrologer.avatar.public_id = Myuploader.public_id;
      astrologer.avatar.url = Myuploader.url;
    }

    await astrologer.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: "astrologer avatar change Success",
      astrologer,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const AstrologerAddNewExpAndEdu = async (req, res) => {
  try {
    const { education, experience } = req.body;

    // Find the astrologer by their ID
    let astrologer = await Astrologer.findById(req.user._id);
    if (!astrologer) {
      return res.status(400).json({
        success: false,
        message: "Session timed out. Please log in again.",
      });
    }

    // Add new education if provided
    if (education) {
      astrologer.education.push({
        edu: education,
      });
    }

    // Add new experience if provided
    if (experience) {
      astrologer.experience.push({
        exp: experience,
      });
    }

    // Save the updated astrologer document
    await astrologer.save({ validateBeforeSave: false });

    // Respond with success
    res.status(200).json({
      success: true,
      message: "Astrologer updated successfully",
      astrologer,
    });
  } catch (error) {
    // Handle any errors
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const AstrologerDeleteExp = async (req, res) => {
  try {
    const { expId } = req.params;

    // Find the astrologer by their ID
    let astrologer = await Astrologer.findById(req.user._id);
    if (!astrologer) {
      return res.status(400).json({
        success: false,
        message: "Session timed out. Please log in again.",
      });
    }

    // Find the experience by ID
    const Myexp = astrologer.experience.id(expId);
    if (!Myexp) {
      return res.status(400).json({
        success: false,
        message: "Experience not found",
      });
    }

    // Remove the experience from the array
    await Myexp.deleteOne();

    // Save the updated astrologer document
    await astrologer.save({ validateBeforeSave: false });

    // Respond with success
    res.status(200).json({
      success: true,
      message: "Experience removed successfully",
      astrologer,
    });
  } catch (error) {
    // Handle any errors
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const AstrologerDeleteEdu = async (req, res) => {
  try {
    const { eduId } = req.params;

    // Find the astrologer by their ID
    let astrologer = await Astrologer.findById(req.user._id);
    if (!astrologer) {
      return res.status(400).json({
        success: false,
        message: "Session timed out. Please log in again.",
      });
    }

    // Find the experience by ID
    const Myedu = astrologer.education.id(eduId);
    if (!Myedu) {
      return res.status(400).json({
        success: false,
        message: "education not found",
      });
    }

    // Remove the education from the array
    await Myedu.deleteOne();

    // Save the updated astrologer document
    await astrologer.save({ validateBeforeSave: false });

    // Respond with success
    res.status(200).json({
      success: true,
      message: "education removed successfully",
      astrologer,
    });
  } catch (error) {
    // Handle any errors
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const AstrologerForgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    let astrologer = await Astrologer.findOne({ email });
    if (!astrologer) {
      return res.status(400).json({
        success: false,
        message: "Email not Found Please! do Registration",
      });
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    astrologer.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    astrologer.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    astrologer.save({ validateBeforeSave: false });

    const subject = "Re-Set Your Password";
    const url = `${process.env.FRONTEND_URL}/api/v1/astrologer/reset/password/${resetToken}`;
    const message = `Welcome astrologer This is Your Re-Set Password Link - ${url}\n if Already Re-Set so, you can ignore`;
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

export const AstrologerResetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    let astrologer = await Astrologer.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!astrologer) {
      return res.status(400).json({
        success: false,
        message: "Token has been Expires",
      });
    }

    const hasPassword = await bcrypt.hash(password, 10);
    astrologer.password = hasPassword;
    astrologer.resetPasswordToken = undefined;
    astrologer.resetPasswordExpire = undefined;
    astrologer.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `Password has been change of ${astrologer.name}`,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ----------------user review on astrologer -----------------------

export const CreateAstrologerReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { astrologerId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }

    let astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer) {
      return res.status(400).json({
        success: false,
        message: "astrologer not found",
      });
    }

    const MyReview = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      avatar: user.avatar?.url,
      comment,
    };

    const test = astrologer.review.find((rev) => {
      return rev.user.toString() === req.user._id.toString();
    });

    if (test) {
      astrologer.review.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString()) {
          (rev.rating = rating), (rev.comment = comment);
        }
      });
    } else {
      astrologer.review.push(MyReview);
    }

    let avg = 0;
    astrologer.rating = astrologer.review.forEach((rev) => {
      avg += rev.rating;
    });
    astrologer.rating = avg / astrologer.review.length;

    await astrologer.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: "Review has been send",
      astrologer,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const UserDeleteAstrologerReview = async (req, res) => {
  try {
    const { astrologerId } = req.params;

    let astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer) {
      return res.status(400).json({
        success: false,
        message: "astrologer not found",
      });
    }

    let review = astrologer.review.filter((rev) => {
      return rev.user.toString() !== req.user._id.toString();
    });

    if (!review) {
      return res.status(400).json({
        success: false,
        message: "Review not found",
      });
    }
    let avg = 0;
    review.forEach((rev) => {
      avg += rev.rating;
    });

    astrologer.rating = avg / review.length;
    astrologer.review = review;

    await astrologer.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "review has been delete",
      astrologer,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const GetAllAstrologer = async (req, res) => {
  try {
    let astrologer = await Astrologer.find();
    if (!astrologer) {
      return res.status(400).json({
        success: false,
        message: " astrologer not found",
      });
    }

    res.status(200).json({
      success: true,
      astrologer,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
 
export const GetSingleAstrologer = async (req, res) => {
  try {
    const { astrologerId } = req.params;

    let astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer) {
      return res.status(400).json({
        success: false,
        message: "astrologer not found",
      });
    }

    res.status(200).json({
      success: true,
      astrologer,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const GetSingleInstructors = async (req, res) => {
  try {
    const { astrologerId } = req.params;

    let astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer) {
      return res.status(400).json({
        success: false,
        message: "astrologer not found",
      });
    }

    res.status(200).json({
      success: true,
      astrologer,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ----------------admin controllers -----------------------

export const AdminDeleteAstrologer = async (req, res) => {
  try {
    const { astrologerId } = req.params;
    let astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer) {
      return res.status(400).json({
        success: false,
        message: "Sorry Admin - astrologer is not in our DataBase",
      });
    }
    if (astrologer.avatar?.public_id) {
      await cloudinary.v2.uploader.destroy(astrologer.avatar.public_id, {
        folder: "astro",
      });
    }
    await astrologer.deleteOne();

    res.status(200).json({
      success: true,
      message: "astrologer has been delete",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const AdminActiveAstrologer = async (req, res) => {
  try {
    const { astrologerId } = req.params;

    let astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer) {
      return res.status(400).json({
        success: false,
        message: "Sorry Admin - astrologer not found",
      });
    }
    astrologer.license = !astrologer.license;

    await astrologer.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Astrologer has been activated",
      astrologer,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const AdminChangeChargePerMinAstrologer = async (req, res) => {
  try {
    const { astrologerId } = req.params;
    const { chargePerMin } = req.body;

    let astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer) {
      return res.status(400).json({
        success: false,
        message: "Sorry Admin - astrologer not found",
      });
    }
    astrologer.chargePerMin = chargePerMin;

    await astrologer.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "ChargePerMin has been updated",
      astrologer,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const AdminDeleteAstrologerReview = async (req, res) => {
  try {
    const { astrologerId } = req.params;
    const { reviewId } = req.body;


    let astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer) {
      return res.status(400).json({
        success: false,
        message: "astrologer not found",
      });
    }

    let review = astrologer.review.filter((rev) => {
      return rev._id.toString() !== reviewId.toString();
    });

    if (!review) {
      return res.status(400).json({
        success: false,
        message: "Review not found",
      });
    }
    let avg = 0;
    review.forEach((rev) => {
      avg += rev.rating;
    });

    astrologer.rating = avg / review.length;
    astrologer.review = review;

    await astrologer.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "review has been delete",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
