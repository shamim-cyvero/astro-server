import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name field required"],
      minLength: [4, "name must have four character"],
      trim: true,
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
        astrologer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "astrologer",
        },
        astrologerName: {
          type: String,
        },
        astrologerAvatar: {
          type: String,
        },
        duration: {
          type: String,
        },
        date: {
          type: String,
        },
        time: {
          type: String,
        },
        price: {
          type: Number,
        },
        razorpay_payment_id: {
          type: String,
          required: true,
        },
      },
    ],
    course: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "course",
        },
        payment_id: {
          type: String,
        },
        date: {
          type: Date,
        },
        name: {
          type: String,
        },
        price: {
          type: Number,
        },
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
