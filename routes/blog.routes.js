import express from "express";
import { UserForgetPassword, UserResetPassword, UserLogin, UserLogout, UserProfile, UserSignup, UserUpdateProfile, UserContact, EmailContact, AdminGetAllUser, AdminDeleteUser,  AdminGetSingleUser, UserEnrolledInCourse } from "../controllers/user.controllers.js";
import { AdminAuthentication, AstrologerAuthentication, authentication } from "../middleware/authentication.js";
import { AdminCreateBlog, AdminDeleteBlog, GetAllBlog, GetSingleBlog } from "../controllers/blog.controllers.js";

const router = express.Router();

router.route("/get/all").get(GetAllBlog);
router.route("/get/single/:blogId").get(GetSingleBlog);

router.route("/create").post(AstrologerAuthentication,AdminAuthentication,AdminCreateBlog);
router.route("/delete/:blogId").delete(AstrologerAuthentication,AdminAuthentication,AdminDeleteBlog);




export default router;
