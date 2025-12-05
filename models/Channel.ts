import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChannel extends Document {
    name: string;
    handle: string;
    description?: string;
    banner?: string;
    avatar?: string;
    ownerId: mongoose.Types.ObjectId;
    subscriberCount: number;
    videoCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const channelSchema = new Schema<IChannel>(
    {
        name: {
            type: String,
            required: [true, "Channel name is required"],
            trim: true,
            minlength: [2, "Channel name must be at least 2 characters"],
            maxlength: [100, "Channel name cannot exceed 100 characters"],
        },
        handle: {
            type: String,
            required: [true, "Channel handle is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^@[a-z0-9_-]{3,30}$/,
                "Handle must start with @ and contain 3-30 characters (letters, numbers, _, -)",
            ],
        },
        description: {
            type: String,
            default: "",
            maxlength: [1000, "Description cannot exceed 1000 characters"],
        },
        banner: {
            type: String,
            default: "",
        },
        avatar: {
            type: String,
            default: "",
        },
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        subscriberCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        videoCount: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for performance
channelSchema.index({ handle: 1 });
channelSchema.index({ ownerId: 1 });
channelSchema.index({ subscriberCount: -1 });

const Channel: Model<IChannel> =
    mongoose.models.Channel || mongoose.model<IChannel>("Channel", channelSchema);

export default Channel;
