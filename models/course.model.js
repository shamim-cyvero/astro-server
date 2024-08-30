import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name field required"],
      minLength: [4, "name must have four character"],
      trim: true,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
    },
    price: {
      type: Number,
    },
    banner: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },

    lectures: [
      {
        name: {
          type: String,
        },
        description: {
          type: String,
        },
        video: [
          {
            public_id: {
              type: String,
            },
            url: {
              type: String,
            },
            title: {
              type: String,
            },
          },
        ],
      },
    ],
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
    enrolledUsers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        payment_id: {
          type: String,
        },
        date: {
          type: Date,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
export const Course = mongoose.model("course", courseSchema);
