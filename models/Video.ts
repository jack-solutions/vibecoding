import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVideo extends Document {
    title: string;
    description: string;
    creatorId: mongoose.Types.ObjectId;
    channelId: mongoose.Types.ObjectId;
    videoUrl: string;
    thumbnailUrl: string;
    duration: number; // in seconds
    visibility: "public" | "private" | "unlisted";
    processingStatus: "pending" | "processing" | "ready" | "failed";
    category: string;
    tags: string[];
    views: number;
    likes: number;
    dislikes: number;
    uploadDate: Date;
    fileSize: number; // in bytes
    resolution: string;
    createdAt: Date;
    updatedAt: Date;
}

const videoSchema = new Schema<IVideo>(
    {
        title: {
            type: String,
            required: [true, "Video title is required"],
            trim: true,
            minlength: [3, "Title must be at least 3 characters"],
            maxlength: [100, "Title cannot exceed 100 characters"],
        },
        description: {
            type: String,
            default: "",
            maxlength: [5000, "Description cannot exceed 5000 characters"],
        },
        creatorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        channelId: {
            type: Schema.Types.ObjectId,
            ref: "Channel",
            required: true,
            index: true,
        },
        videoUrl: {
            type: String,
            required: [true, "Video URL is required"],
        },
        thumbnailUrl: {
            type: String,
            default: "",
        },
        duration: {
            type: Number,
            required: true,
            min: 0,
        },
        visibility: {
            type: String,
            enum: {
                values: ["public", "private", "unlisted"],
                message: "{VALUE} is not a valid visibility option",
            },
            default: "public",
            index: true,
        },
        processingStatus: {
            type: String,
            enum: {
                values: ["pending", "processing", "ready", "failed"],
                message: "{VALUE} is not a valid processing status",
            },
            default: "ready",
            index: true,
        },
        category: {
            type: String,
            default: "General",
            maxlength: [50, "Category cannot exceed 50 characters"],
        },
        tags: {
            type: [String],
            default: [],
            validate: [
                {
                    validator: function (tags: string[]) {
                        return tags.length <= 20;
                    },
                    message: "Cannot have more than 20 tags",
                },
            ],
        },
        views: {
            type: Number,
            default: 0,
            min: 0,
            index: true,
        },
        likes: {
            type: Number,
            default: 0,
            min: 0,
        },
        dislikes: {
            type: Number,
            default: 0,
            min: 0,
        },
        uploadDate: {
            type: Date,
            default: Date.now,
            index: true,
        },
        fileSize: {
            type: Number,
            required: true,
            min: 0,
        },
        resolution: {
            type: String,
            default: "1080p",
            maxlength: [20, "Resolution cannot exceed 20 characters"],
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes for common queries
videoSchema.index({ visibility: 1, uploadDate: -1 });
videoSchema.index({ visibility: 1, views: -1 });
videoSchema.index({ creatorId: 1, uploadDate: -1 });
videoSchema.index({ channelId: 1, uploadDate: -1 });
videoSchema.index({ category: 1, views: -1 });

// Text index for search
videoSchema.index({ title: "text", description: "text", tags: "text" });

const Video: Model<IVideo> =
    mongoose.models.Video || mongoose.model<IVideo>("Video", videoSchema);

export default Video;
