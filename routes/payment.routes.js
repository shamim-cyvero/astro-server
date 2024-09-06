import express from "express";
import { AdminGetAllTransaction,  Getkey, PaymentProcess, PaymentVerfication } from "../controllers/payment.controllers.js";
import { AdminAuthentication, AstrologerAuthentication, authentication } from "../middleware/authentication.js";

const router = express.Router();

router.route("/key").post(authentication,Getkey);
router.route("/process").post(authentication,PaymentProcess);
// router.route("/verfication").post(authentication,PaymentVerfication);
router.route("/verfication/:courseId").post(authentication,PaymentVerfication);
router.route("/get/all").get(AstrologerAuthentication ,AdminAuthentication,AdminGetAllTransaction);





export default router;
