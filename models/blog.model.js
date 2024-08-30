import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "name field required"],
      minLength: [4, "name must have four character"],
      trim: true,
      lowercase: true,
    },

    content: {
      type: String,
    },
    banner: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    view: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export const Blog = mongoose.model("blog", blogSchema);
