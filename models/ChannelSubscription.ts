import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChannelSubscription extends Document {
    channelId: mongoose.Types.ObjectId;
    subscriberId: mongoose.Types.ObjectId;
    subscribedAt: Date;
}

const channelSubscriptionSchema = new Schema<IChannelSubscription>(
    {
        channelId: {
            type: Schema.Types.ObjectId,
            ref: "Channel",
            required: true,
            index: true,
        },
        subscriberId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        subscribedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to prevent duplicate subscriptions
channelSubscriptionSchema.index({ channelId: 1, subscriberId: 1 }, { unique: true });

const ChannelSubscription: Model<IChannelSubscription> =
    mongoose.models.ChannelSubscription ||
    mongoose.model<IChannelSubscription>("ChannelSubscription", channelSubscriptionSchema);

export default ChannelSubscription;
