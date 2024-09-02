import express from "express";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";
import cors from "cors";

import astrologerRoutes from "./routes/astrologer.routes.js";
import userRoutes from "./routes/user.routes.js";
import courseRoutes from "./routes/course.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

import astroDb from "./DataBase/astroDb.js";

config({ path: "./config/config.env" });

astroDb()

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "https://new-astrosoull.vercel.app"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  // secure: true,
});

// all routes



app.use("/api/v1/astrologer", astrologerRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/blog", blogRoutes);
app.use("/api/v1/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.send("server is working");
});

app.listen(process.env.PORT || 9000, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
