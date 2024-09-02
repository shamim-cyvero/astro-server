import express from "express";
import { Getkey, PaymentProcess, PaymentVerfication } from "../controllers/payment.controllers.js";
import { authentication } from "../middleware/authentication.js";

const router = express.Router();

router.route("/key").get(authentication,Getkey);
router.route("/process").post(authentication,PaymentProcess);
router.route("/verfication").post(PaymentVerfication);





export default router;
