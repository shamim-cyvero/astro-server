import mongoose from "mongoose";

const userAndEnrolledUserSchema = new mongoose.Schema(
  {
    users:{
        type:Number,
        default:0
        // required:[true,'user must be required']
    },
    enrolledUsers:{
        type:Number,
        default:0
        // required:[true,'userEnrolled must be required']
    }
  },
  {
    timestamps: true,
  }
);

export const UserAndEnrolledUser = mongoose.model("userAndEnrolledUser", userAndEnrolledUserSchema);
