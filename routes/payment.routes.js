import express from "express";
import { AdminDeleteTransaction, AdminGetAllTransaction,  Getkey, PaymentProcess, PaymentVerfication } from "../controllers/payment.controllers.js";
import { AdminAuthentication, AstrologerAuthentication, authentication } from "../middleware/authentication.js";

const router = express.Router();

router.route("/key").post(authentication,Getkey);
router.route("/process").post(authentication,PaymentProcess);
router.route("/verfication/:courseId").post(authentication,PaymentVerfication);
router.route("/get/all").get(AstrologerAuthentication ,AdminAuthentication,AdminGetAllTransaction);
router.route("/delete/:TranId").delete(AstrologerAuthentication ,AdminAuthentication,AdminDeleteTransaction);





export default router;
