import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar?: string;
    role: "admin" | "creator" | "viewer" | "advertiser";
    channelId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [50, "Name cannot exceed 50 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please provide a valid email address",
            ],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
            select: false, // Don't include password in queries by default
        },
        avatar: {
            type: String,
            default: "",
        },
        role: {
            type: String,
            enum: {
                values: ["admin", "creator", "viewer", "advertiser"],
                message: "{VALUE} is not a valid role",
            },
            default: "viewer",
        },
        channelId: {
            type: Schema.Types.ObjectId,
            ref: "Channel",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ channelId: 1 });

// Prevent password from being returned in JSON responses
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
