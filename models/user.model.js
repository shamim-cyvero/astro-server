import mongoose from "mongoose";

const userSchema = new mongoose.Schema( 
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

    password: {
      type: String,
      required: [true, "password  field required"],
      select: false,
    },

    address: {
      type: String,
    },

    avatar: {
      public_id: {
        type: String,
      },
      url: {
        type: String, 
      },
    },

    role: {
      type: String,
      enum: ["user", "admin", "astrologer"],
      default: "user",
    },

    meeting: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "astrologer",
      },
    ],
    course: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "course",
      },
    ],

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("user", userSchema);
