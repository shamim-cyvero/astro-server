import mongoose from "mongoose";

const astrologerSchema = new mongoose.Schema(
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
    },
    password: {
      type: String,
      required: [true, "password  field required"],
      select: false,
    },
    address: {
      type: String,
    },
    about: {
      type: String,
    },
    education: [
      {
        edu: {
          type: String,
        },
      },
    ],
    experience: [
      {
        exp: {
          type: String,
        },
      },
    ],
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
      default: "astrologer",
    },

    rating: {
      type: Number,
      default: 0,
      set: (value) => Math.round(value * 10) / 10, // Rounds to 1 decimal place
    },

    review: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
        name: {
          type: String,
        },
        avatar: {
          type: String,
        },
        comment: {
          type: String,
        },
        rating: {
          type: Number,
        },
      },
    ],

    meeting: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        userName: {
          type: String,
        },
        userAvatar: {
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
        commonId: {
          type: String,
        },
        
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
        live: {
          type: String,
          enum: ["Upcoming", "live", "completed"],
          default: "Upcoming"
        },
        attempt: {
          type: Boolean,
          default: false
        }
      },
    ],

    chargePerMin: {
      type: Number,
      default:0

    },
    expert: {
      type: String,
    },
    language: {
      type: String,
    },
    license : {
      type: Boolean,
      default:false
    },
    live: {
      type: Boolean,
      default:false
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

export const Astrologer = mongoose.model("astrologer", astrologerSchema);
