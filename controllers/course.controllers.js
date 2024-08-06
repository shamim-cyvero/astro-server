import { Course } from "../models/course.model.js";
import cloudinary from "cloudinary";
import { User } from "../models/user.model.js";

export const AdminCreateCourse = async (req, res) => {
  try {
    const { name, description, price, banner } = req.body;
    if (!name || !description || !price) {
      return res.status(400).json({
        success: false,
        message: "name description price required",
      });
    }
    if (banner) {
      const Myuploader = await cloudinary.v2.uploader.upload(banner, {
        folder: "astro",
      });
      let course = await Course.create({
        name,
        description,
        price,
        banner: {
          public_id: Myuploader.public_id,
          url: Myuploader.url,
        },
      });
      res.status(200).json({
        success: true,
        message: "course has been create ",
        course,
      });
    }
    let course = await Course.create({
      name,
      description,
      price,
    });

    res.status(200).json({
      success: true,
      message: "course has been create ",
      course,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const AdminAddLecture = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "name description required",
      });
    }
    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({
        success: false,
        message: "course not found",
      });
    }

    // let lecture = course.lectures.id(lectureId);
    // if (!lecture) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "lecture not found",
    //   });
    // }
    course.lectures.push({ name, description });
    await course.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
      message: "course lecture has been add ",
      course,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const AdminAddLectureVideo = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lectureId, video, title } = req.body;
    if (!video || !title) {
      return res.status(400).json({
        success: false,
        message: "title description required",
      });
    }
    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({
        success: false,
        message: "course not found",
      });
    }

    let lecture = course.lectures.id(lectureId);
    if (!lecture) {
      return res.status(400).json({
        success: false,
        message: "lecture not found",
      });
    }
    // const Myuploader = await cloudinary.v2.uploader.upload(video, {
    //   folder: "astro",
    // });
    let newVideo = {
      public_id: "fake id and url",
      url: "fake id and url",
      title,
    };
    lecture.video.push(newVideo);

    await course.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
      message: "course lecture has been add ",
      course,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const GetAllCourse = async (req, res) => {
  try {
    let course = await Course.find();
    if (!course) {
      return res.status(400).json({
        success: false,
        message: "course not found",
      });
    }

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const GetSingleCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({
        success: false,
        message: "course not found",
      });
    }

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ----------------ADMIN Delete Course--------------

export const AdminDeleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({
        success: false,
        message: "course not found",
      });
    }
    // Delete each video from Cloudinary
    for (const video of course.lectures) {
      await cloudinary.v2.uploader.destroy(video.public_id, {
        folder: "astro",
      });
    }

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: "course has been deleted ",
      course,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const AdminDeleteLecture = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lectureId } = req.body;

    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Find the lecture to be removed
    const lectureIndex = course.lectures.findIndex(
      (lecture) => lecture._id.toString() === lectureId
    );
    if (lectureIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }

    const lecture = course.lectures[lectureIndex];

    // Delete each video from Cloudinary
    // for (const video of lecture.video) {
    //   await cloudinary.v2.uploader.destroy(video.public_id, {
    //     folder: "astro",
    //   });
    // }

    // Remove the lecture from the course
    course.lectures.splice(lectureIndex, 1);
    await course.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Lecture has been deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const AdminDeleteLectureVideo = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lectureId, videoId } = req.body;

    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Course not found",
      });
    }

    // Find the lecture within the course
    const lecture = course.lectures.id(lectureId);
    if (!lecture) {
      return res.status(400).json({
        success: false,
        message: "Lecture not found",
      });
    }

    // Find the video within the lecture
    const videoIndex = lecture.video.findIndex(
      (video) => video._id.toString() === videoId
    );
    if (videoIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Video not found",
      });
    }

    const video = lecture.video[videoIndex];

    // Delete the video from Cloudinary
    await cloudinary.v2.uploader.destroy(video.public_id, {
      folder: "astro",
    });

    // Remove the video from the lecture's video array
    lecture.video.splice(videoIndex, 1);

    // Save the course
    await course.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Video has been deleted",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ----------------ADMIN UPDATE Course--------------

export const AdminUpdateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { name, description, banner } = req.body;

    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Course not found",
      });
    }

    // Update course details
    if (name) course.name = name;
    if (description) course.description = description;

    // Update banner if provided
    if (banner) {
      // Delete the old banner from Cloudinary
      await cloudinary.v2.uploader.destroy(course.banner.public_id, {
        folder: "astro",
      });

      // Upload the new banner
      const uploadResponse = await cloudinary.v2.uploader.upload(banner, {
        folder: "astro",
      });

      // Update the course with the new banner details
      course.banner.public_id = uploadResponse.public_id;
      course.banner.url = uploadResponse.secure_url;
    }

    await course.save();

    res.status(200).json({
      success: true,
      message: "Course has been updated",
      course,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const AdminUpdateLecture = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { name, description, lectureId } = req.body;

    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Course not found",
      });
    }

    let lecture = course.lectures.id(lectureId);
    if (!lecture) {
      return res.status(400).json({
        success: false,
        message: "Lecture not found",
      });
    }

    // Update lecture fields
    if (name) lecture.name = name;
    if (description) lecture.description = description;

    await course.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Lecture has been updated",
      course,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const AdminUpdateLectureVideo = async (req, res) => {
  try {
    const { videoId, video, lectureId, title } = req.body;
    const { courseId } = req.params;

    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Course not found",
      });
    }

    // Find the lecture within the course
    const lecture = course.lectures.id(lectureId);
    if (!lecture) {
      return res.status(400).json({
        success: false,
        message: "Lecture not found",
      });
    }

    // Find the video within the lecture
    const oldVideo = lecture.video.id(videoId);
    if (!oldVideo) {
      return res.status(400).json({
        success: false,
        message: "Video not found",
      });
    }

    // Delete the old video from Cloudinary if a new video is provided
    if (video) {
      await cloudinary.v2.uploader.destroy(oldVideo.public_id, {
        folder: "astro",
      });

      // Upload the new video to Cloudinary
      const uploadResponse = await cloudinary.v2.uploader.upload(video, {
        folder: "astro",
      });

      // Update video details with the new video info
      oldVideo.public_id = uploadResponse.public_id;
      oldVideo.url = uploadResponse.secure_url;
      oldVideo.title = title;
    }

    await course.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Lecture video has been updated",
      course,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const CreateCourseReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { courseId } = req.params;

    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Course not found",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }

    const MyReview = {
      user: req.user._id,
      name: user.name,
      rating: Number(rating),
      avatar: user.avatar?.url,
      comment,
    };

    const test = course.review.find((rev) => {
      return rev.user.toString() === req.user._id.toString();
    });

    if (test) {
      course.review.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString()) {
          (rev.rating = rating), (rev.comment = comment);
        }
      });
    } else {
      course.review.push(MyReview);
    }

    let avg = 0;
    course.review.forEach((rev) => {
      avg += rev.rating;
    });
    course.rating = avg / course.review.length;

    await course.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: "Review has been send",
      course,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const UserDeleteCourseReview = async (req, res) => {
  try {
    const { courseId } = req.params;

    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Course not found",
      });
    }

    let review = course.review.filter((rev) => {
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

    course.rating = avg / review.length;
    course.review = review;

    await course.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "review has been delete",
      course,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
