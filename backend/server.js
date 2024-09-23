const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const moviesRouter = require("./routes/moviesRoute");
const genreRouter = require("./routes/genreRoute");
const countryRoutes = require("./routes/countryRoute");
const commentRoute = require("./routes/commentRoute");
const reportRoute = require("./routes/reportRoute");
const reportCommentRoutes = require("./routes/reportCommentRoute");
const cors = require("cors");
const connectDB = require("./config/db"); // Import file kết nối MongoDB
const userRouter = require("./routes/userRoute");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
const port = 4000;

// Kết nối đến MongoDB
connectDB();
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // Thay bằng domain của frontend
    credentials: true,
  })
);

app.use(bodyParser.json());
//Các router
app.use("/api/movies", moviesRouter);
app.use("/api/users", userRouter);
app.use("/api/genres", genreRouter);
app.use("/api/countries", countryRoutes);
app.use("/api/comments", commentRoute);
app.use("/api/reports", reportRoute);
app.use("/api/report-comments", reportCommentRoutes);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
