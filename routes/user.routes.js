import express from "express";
import { UserForgetPassword, UserResetPassword, UserLogin, UserLogout, UserProfile, UserSignup, UserUpdateProfile, UserContact, EmailContact, AdminGetAllUser, AdminDeleteUser,  AdminGetSingleUser, UserEnrolledInCourse, UserUpdateAvatar, PaymentGetkeyMeeting, MeetingPaymentProcess, MeetingPaymentVerfication, GetUserAndEnrolledUserData } from "../controllers/user.controllers.js";
import { AdminAuthentication, AstrologerAuthentication, authentication } from "../middleware/authentication.js";

const router = express.Router();

router.route("/signup").post(UserSignup);
router.route("/login").post(UserLogin);
router.route("/logout").get(UserLogout);

router.route("/profile").get(authentication, UserProfile);
router.route("/update/profile").put(authentication,UserUpdateProfile); 
router.route("/update/avatar").put(authentication,UserUpdateAvatar); 

router.route("/forget/password").post(UserForgetPassword);
router.route("/reset/password/:token").put(UserResetPassword);


//------------------user Payment for meeting ----------------------
router.route("/get/key/meeting/payment").get(authentication,PaymentGetkeyMeeting); 
router.route("/meeting/payment/process").post(authentication,MeetingPaymentProcess);
router.route("/meeting/payment/verfication/:astrologerId").post(authentication,MeetingPaymentVerfication);



//------------------user enrolled in the course----------------------
router.route("/enrolled/course").post(authentication,UserEnrolledInCourse); 

//------------------ user contact model--------------------------
router.route("/contact").post(UserContact);
router.route("/contact/email").post(EmailContact);


// ----------------admin Routes -----------------------

router.route("/admin/get/stats").get(AstrologerAuthentication ,AdminAuthentication,GetUserAndEnrolledUserData);
router.route("/admin/get/all").get(AstrologerAuthentication ,AdminAuthentication,AdminGetAllUser);
router.route("/admin/delete/:userId").delete(AstrologerAuthentication ,AdminAuthentication, AdminDeleteUser);
router.route("/admin/get/single/:userId").get(AstrologerAuthentication ,AdminAuthentication, AdminGetSingleUser);



export default router;
