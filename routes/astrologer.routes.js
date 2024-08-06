import express from "express";
import { AdminAuthentication, AstrologerAuthentication, authentication } from "../middleware/authentication.js";
import { AdminActiveAstrologer, AdminDeleteAstrologer, AstrologerForgetPassword, AstrologerLogin, AstrologerLogout, AstrologerProfile, AstrologerResetPassword, AstrologerSignup, AstrologerUpdateProfile, CreateAstrologerReview, GetAllAstrologer, GetSingleAstrologer, UserDeleteAstrologerReview } from "../controllers/astrologer.controllers.js";

const router = express.Router();

router.route("/signup").post(AstrologerSignup);
router.route("/login").post(AstrologerLogin);
router.route("/logout").get(AstrologerLogout);

router.route("/profile").get(AstrologerAuthentication, AstrologerProfile);
router.route("/update/profile").put(AstrologerAuthentication,AstrologerUpdateProfile);

router.route("/forget/password").post(AstrologerForgetPassword);
router.route("/reset/password/:token").put(AstrologerResetPassword);

router.route("/get/all").get(GetAllAstrologer);
router.route("/get/single/:astrologerId").get(GetSingleAstrologer);

// ----------------user review on astrologer -----------------------
router.route("/create/user/review/:astrologerId").put(authentication,CreateAstrologerReview);
router.route("/delete/user/review/:astrologerId").delete(authentication,UserDeleteAstrologerReview);



// ----------------admin Routes -----------------------
router.route("/admin/delete/:astrologerId").delete(AstrologerAuthentication,AdminAuthentication,AdminDeleteAstrologer);
router.route("/admin/active/:astrologerId").delete(AstrologerAuthentication,AdminAuthentication,AdminActiveAstrologer);





export default router;
