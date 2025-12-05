import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "path";
import { auth } from "@vc-yt-clone/auth";
import { toNodeHandler } from "better-auth/node";
import { userRoutes, channelRoutes, videoRoutes, engagementRoutes, searchRoutes, playlistRoutes, analyticsRoutes } from "./routes";

const app = express();

app.use(
	cors({
		origin: process.env.CORS_ORIGIN || "",
		methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

// Auth routes (must be before json middleware for proper handling)
app.all("/api/auth{/*path}", toNodeHandler(auth));

// JSON body parser
app.use(express.json());

// Static file serving for uploads
const uploadDir = process.env.UPLOAD_DIR || "./uploads";
app.use("/uploads", express.static(path.resolve(uploadDir)));

// API Routes
app.use("/api/user", userRoutes);
app.use("/api/channel", channelRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/engagement", engagementRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/playlist", playlistRoutes);
app.use("/api/analytics", analyticsRoutes);


// Health check
app.get("/", (_req, res) => {
	res.status(200).send("OK");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

