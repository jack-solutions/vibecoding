const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const videoRoutes = require("./routes/videoRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/videos", videoRoutes);

mongoose.connect("mongodb://127.0.0.1:27017/youtubeclone");

app.listen(5001, () => console.log("Backend running on port 5001"));
