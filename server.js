import express from "express";
import { DataBaseConnection } from "./dataBase/DB.js";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";

config({ path: "./config/config.env" });
DataBaseConnection();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// all routes
import astrologerRoutes from "./routes/astrologer.routes.js";
import userRoutes from "./routes/user.routes.js";
import courseRoutes from "./routes/course.routes.js";

app.use("/api/v1/astrologer", astrologerRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/course", courseRoutes);

// app.on()
app.get("/", (req, res) => {
  res.send("server is working");
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
