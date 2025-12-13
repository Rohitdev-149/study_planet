const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const userRoutes = require("./routes/User");
const courseRoutes = require("./routes/Course");
const paymentRoutes = require("./routes/Payment");
const profileRoutes = require("./routes/Profile");
const sectionRoutes = require("./routes/Section");

const database = require("./config/database");
const { cloudinaryConnect } = require("./config/cloudinary");
dotenv.config();
const fileUpload = require("express-fileupload");

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || "0.0.0.0";
// database connection
database.connect();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(cookieParser());

// simple request logger to help debug routing issues
app.use((req, res, next) => {
  console.log(`[req] ${req.method} ${req.originalUrl}`);
  next();
});

// Apply fileUpload middleware only to routes that need it
app.use(
  "/api/v1/course/create-course",
  fileUpload({
    useTempFiles: true,
    tempFileDir: process.env.TEMP || "tmp/",
    createParentPath: true,
    debug: false,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50mb limit
  })
);

app.use(
  "/api/v1/profile/update-display-picture",
  fileUpload({
    useTempFiles: true,
    tempFileDir: process.env.TEMP || "tmp/",
    createParentPath: true,
    debug: false,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50mb limit
  })
);

// cloudinary connection
cloudinaryConnect();
// routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/section", sectionRoutes);

// log registered profile routes for debugging
try {
  const routeList = profileRoutes.stack
    .filter((s) => s.route)
    .map((s) =>
      Object.keys(s.route.methods).map(
        (m) => m.toUpperCase() + " " + s.route.path
      )
    )
    .flat();
  console.log("Profile routes mounted:", routeList);
} catch (e) {
  console.log("Could not list profile routes:", e.message);
}

// default route
app.get("/", (req, res) => {
  res.send("Welcome to the CodeHelp Backend Server");
});

const server = app.listen(PORT, HOST, () => {
  const address = server.address();
  console.log(`Server is running on ${address.address}:${address.port}`);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
