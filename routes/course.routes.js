import express from "express";
import { AdminAuthentication, AstrologerAuthentication, authentication } from "../middleware/authentication.js";
import { AdminAddLecture, AdminAddLectureVideo, AdminCreateCourse, AdminDeleteCourse, AdminDeleteCourseReview, AdminDeleteLecture, AdminDeleteLectureVideo, AdminUpdateCourse, AdminUpdateLecture, AdminUpdateLectureVideo, CreateCourseReview, GetAllCourse, GetSingleCourse, SearchCourse, SearchCourseByCategory, UserDeleteCourseReview } from "../controllers/course.controllers.js";

const router = express.Router();


router.route("/get/all").get(GetAllCourse);
router.route("/get/single/:courseId").get(GetSingleCourse);

router.route('/search/:key').get(SearchCourse);      // search in input box
router.route('/category/:key').get(SearchCourseByCategory);      // search in course category

// ----------------user review on course -----------------------
router.route("/user/create/review/:courseId").put(authentication,CreateCourseReview);
router.route("/user/delete/review/:courseId").delete(authentication,UserDeleteCourseReview); 


// ----------------admin Routes -----------------------
// router.route("/admin/create").post(AdminCreateCourse);
router.route("/admin/create").post(AstrologerAuthentication,AdminAuthentication,AdminCreateCourse);
router.route("/admin/add/lecture/:courseId").put(AstrologerAuthentication,AdminAuthentication,AdminAddLecture);
router.route("/admin/add/lecture/video/:courseId").put(AstrologerAuthentication,AdminAuthentication,AdminAddLectureVideo);

router.route("/admin/delete/:courseId").delete(AstrologerAuthentication,AdminAuthentication,AdminDeleteCourse);
router.route("/admin/delete/lecture/:courseId").put(AstrologerAuthentication,AdminAuthentication,AdminDeleteLecture);
router.route("/admin/delete/lecture/video/:courseId").put(AstrologerAuthentication,AdminAuthentication,AdminDeleteLectureVideo);

router.route("/admin/update/:courseId").put(AstrologerAuthentication,AdminAuthentication,AdminUpdateCourse);
router.route("/admin/update/lecture/:courseId").put(AstrologerAuthentication,AdminAuthentication,AdminUpdateLecture);
router.route("/admin/update/lecture/video/:courseId").put(AstrologerAuthentication,AdminAuthentication,AdminUpdateLectureVideo);

router.route("/admin/delete/user/review/:courseId").put(AstrologerAuthentication,AdminAuthentication,AdminDeleteCourseReview);

export default router;
