import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVideoLike extends Document {
    videoId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    type: "like" | "dislike";
    createdAt: Date;
}

const videoLikeSchema = new Schema<IVideoLike>(
    {
        videoId: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: true,
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ["like", "dislike"],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to prevent duplicate likes from same user
videoLikeSchema.index({ videoId: 1, userId: 1 }, { unique: true });

const VideoLike: Model<IVideoLike> =
    mongoose.models.VideoLike || mongoose.model<IVideoLike>("VideoLike", videoLikeSchema);

export default VideoLike;
