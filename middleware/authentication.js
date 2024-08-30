import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Astrologer } from "../models/astrologer.model.js";

export const authentication = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Login First",
    });
  }

  const decoded = jwt.verify(token, process.env.JWT);
  req.user = await User.findById(decoded._id);
  next();
};

export const AstrologerAuthentication = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Login First in Astrologer-middleware",
    });
  }

  const decoded = jwt.verify(token, process.env.JWT);
  req.user = await Astrologer.findById(decoded._id);
  next();
};
export const AdminAuthentication = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: `Role : ${req.user.role} is not allowed to access this Resource`,
      });
    }
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
