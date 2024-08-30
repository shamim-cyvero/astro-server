import { Blog } from "../models/blog.model.js";

export const GetAllBlog = async (req, res) => {
  try {
    let blog = await Blog.find();
    if (!blog) {
      return res.status(400).json({
        success: false,
        message: "blog not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "blog has been upload",
      blog,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const GetSingleBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    let blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(400).json({
        success: false,
        message: "blog not found",
      });
    }

    res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const AdminCreateBlog = async (req, res) => {
  try {
    const { title, content, banner } = req.body;
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "content title required",
      });
    }
    if (banner) {
      const Myuploader = await cloudinary.v2.uploader.upload(banner, {
        folder: "astro",
      });
      let blog = await Blog.create({
        title,
        content,
        banner: {
          public_id: Myuploader.public_id,
          url: Myuploader.url,
        },
      });
      res.status(200).json({
        success: true,
        message: "blog has been upload ",
        blog,
      });
    }

    let blog = await Blog.create({ title, content });

    res.status(200).json({
      success: true,
      message: "blog has been upload",
      blog,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const AdminDeleteBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    let blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(400).json({
        success: false,
        message: "blog not found",
      });
    }
    // Delete banner  from Cloudinary
    await cloudinary.v2.uploader.destroy(blog.banner.public_id, {
      folder: "astro",
    });

    await blog.deleteOne();

    res.status(200).json({
      success: true,
      message: "blog has been delete",
      blog,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
