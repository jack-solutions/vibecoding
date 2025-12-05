const express = require("express");
const multer = require("multer");
const Video = require("../models/Video");
const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("video"), async (req, res) => {
  const video = await Video.create({
    title: req.body.title,
    description: req.body.description,
    videoUrl: `/uploads/${req.file.filename}`,
  });
  res.json(video);
});


router.get("/", async (req, res) => {
  const videos = await Video.find({});
  res.json(videos);
});

module.exports = router;
