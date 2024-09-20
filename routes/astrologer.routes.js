import express from "express";
import { AdminAuthentication, AstrologerAuthentication, authentication } from "../middleware/authentication.js";
import { AdminActiveAstrologer, AdminChangeChargePerMinAstrologer, AdminDeleteAstrologer, AdminDeleteAstrologerReview, AstrologerAddNewExpAndEdu, AstrologerCreateZoomMeeting, AstrologerDeleteEdu, AstrologerDeleteExp, AstrologerForgetPassword, AstrologerLogin, AstrologerLogout, AstrologerProfile, AstrologerResetPassword, AstrologerSignup,  AstrologerUpdateProfile, AstrologeUpdateAvatar, CreateAstrologerReview, GetAllAstrologer, GetSingleAstrologer, GetSingleInstructors, UserDeleteAstrologerReview } from "../controllers/astrologer.controllers.js";

const router = express.Router();

router.route("/signup").post(AstrologerSignup);
router.route("/login").post(AstrologerLogin);
router.route("/logout").get(AstrologerLogout);   

router.route("/profile").get(AstrologerAuthentication, AstrologerProfile);
router.route("/update/profile").put(AstrologerAuthentication,AstrologerUpdateProfile);
router.route("/update/avatar").put(AstrologerAuthentication,AstrologeUpdateAvatar);

router.route("/new/expandedu").put(AstrologerAuthentication,AstrologerAddNewExpAndEdu);
router.route("/delete/exp/:expId").delete(AstrologerAuthentication,AstrologerDeleteExp);
router.route("/delete/edu/:eduId").delete(AstrologerAuthentication,AstrologerDeleteEdu);

router.route("/create/meeting/:meetingId").get(AstrologerAuthentication,AstrologerCreateZoomMeeting);

router.route("/forget/password").post(AstrologerForgetPassword);
router.route("/reset/password/:token").put(AstrologerResetPassword);

router.route("/get/all").get(GetAllAstrologer);
router.route("/get/single/:astrologerId").get(GetSingleAstrologer); 
router.route("/get/instructors").get(GetSingleInstructors);

// ----------------user review on astrologer -----------------------
router.route("/create/user/review/:astrologerId").put(authentication,CreateAstrologerReview);
router.route("/delete/user/review/:astrologerId").delete(authentication,UserDeleteAstrologerReview); 
router.route("/admin/delete/user/review/:astrologerId").put(AstrologerAuthentication,AdminAuthentication,AdminDeleteAstrologerReview); 



// ----------------admin Routes -----------------------
router.route("/admin/delete/:astrologerId").delete(AstrologerAuthentication,AdminAuthentication,AdminDeleteAstrologer);
router.route("/admin/active/:astrologerId").get(AstrologerAuthentication,AdminAuthentication,AdminActiveAstrologer);
router.route("/admin/change/meeting/price/:astrologerId").put(AstrologerAuthentication,AdminAuthentication,AdminChangeChargePerMinAstrologer);





export default router;
