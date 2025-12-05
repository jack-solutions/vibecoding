import prisma from "../index";

// ============================================
// Types
// ============================================

export interface SubscriptionStatus {
    isSubscribed: boolean;
    notificationsEnabled: boolean;
}

export interface ChannelSubscribers {
    subscribers: {
        id: string;
        subscribedAt: Date;
        userProfile: {
            id: string;
            avatar: string | null;
            user: {
                name: string | null;
            };
        };
    }[];
    total: number;
}

export interface UserSubscriptions {
    subscriptions: {
        id: string;
        subscribedAt: Date;
        notificationsEnabled: boolean;
        channel: {
            id: string;
            name: string;
            handle: string;
            avatar: string | null;
            subscriberCount: number;
            verified: boolean;
        };
    }[];
    total: number;
}

// ============================================
// Repository Functions
// ============================================

/**
 * Get subscription by subscriber and channel
 */
export async function getSubscription(subscriberId: string, channelId: string) {
    return prisma.subscription.findUnique({
        where: {
            subscriberId_channelId: {
                subscriberId,
                channelId,
            },
        },
    });
}

/**
 * Get subscription status for a user and channel
 */
export async function getSubscriptionStatus(
    subscriberId: string,
    channelId: string
): Promise<SubscriptionStatus> {
    const subscription = await getSubscription(subscriberId, channelId);

    if (!subscription) {
        return {
            isSubscribed: false,
            notificationsEnabled: false,
        };
    }

    return {
        isSubscribed: true,
        notificationsEnabled: subscription.notificationsEnabled,
    };
}

/**
 * Subscribe to a channel
 */
export async function subscribe(
    subscriberId: string,
    channelId: string,
    notificationsEnabled: boolean = true
) {
    // Check if already subscribed
    const existing = await getSubscription(subscriberId, channelId);
    if (existing) {
        return { action: "none", subscription: existing };
    }

    // Prevent self-subscription
    const channel = await prisma.channel.findUnique({
        where: { id: channelId },
        select: { userProfileId: true },
    });

    if (channel?.userProfileId === subscriberId) {
        throw new Error("Cannot subscribe to your own channel");
    }

    // Create subscription
    const subscription = await prisma.subscription.create({
        data: {
            subscriberId,
            channelId,
            notificationsEnabled,
        },
    });

    // Update channel subscriber count
    await prisma.channel.update({
        where: { id: channelId },
        data: { subscriberCount: { increment: 1 } },
    });

    return { action: "subscribed", subscription };
}

/**
 * Unsubscribe from a channel
 */
export async function unsubscribe(subscriberId: string, channelId: string) {
    const existing = await getSubscription(subscriberId, channelId);

    if (!existing) {
        return { action: "none" };
    }

    // Delete subscription
    await prisma.subscription.delete({
        where: { id: existing.id },
    });

    // Update channel subscriber count
    await prisma.channel.update({
        where: { id: channelId },
        data: { subscriberCount: { decrement: 1 } },
    });

    return { action: "unsubscribed" };
}

/**
 * Toggle subscription to a channel
 */
export async function toggleSubscription(
    subscriberId: string,
    channelId: string
) {
    const existing = await getSubscription(subscriberId, channelId);

    if (existing) {
        return unsubscribe(subscriberId, channelId);
    } else {
        return subscribe(subscriberId, channelId);
    }
}

/**
 * Update notification preference
 */
export async function updateNotificationPreference(
    subscriberId: string,
    channelId: string,
    notificationsEnabled: boolean
) {
    const subscription = await getSubscription(subscriberId, channelId);

    if (!subscription) {
        throw new Error("Not subscribed to this channel");
    }

    return prisma.subscription.update({
        where: { id: subscription.id },
        data: { notificationsEnabled },
    });
}

/**
 * Get a channel's subscribers
 */
export async function getChannelSubscribers(
    channelId: string,
    limit: number = 20,
    offset: number = 0
): Promise<ChannelSubscribers> {
    const where = { channelId };

    const [subscriptions, total] = await Promise.all([
        prisma.subscription.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
            select: {
                id: true,
                createdAt: true,
                subscriber: {
                    select: {
                        id: true,
                        avatar: true,
                        user: {
                            select: { name: true },
                        },
                    },
                },
            },
        }),
        prisma.subscription.count({ where }),
    ]);

    return {
        subscribers: subscriptions.map((sub) => ({
            id: sub.id,
            subscribedAt: sub.createdAt,
            userProfile: sub.subscriber,
        })),
        total,
    };
}

/**
 * Get a user's subscriptions
 */
export async function getUserSubscriptions(
    subscriberId: string,
    limit: number = 50,
    offset: number = 0
): Promise<UserSubscriptions> {
    const where = { subscriberId };

    const [subscriptions, total] = await Promise.all([
        prisma.subscription.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
            select: {
                id: true,
                createdAt: true,
                notificationsEnabled: true,
                channel: {
                    select: {
                        id: true,
                        name: true,
                        handle: true,
                        avatar: true,
                        subscriberCount: true,
                        verified: true,
                    },
                },
            },
        }),
        prisma.subscription.count({ where }),
    ]);

    return {
        subscriptions: subscriptions.map((sub) => ({
            id: sub.id,
            subscribedAt: sub.createdAt,
            notificationsEnabled: sub.notificationsEnabled,
            channel: sub.channel,
        })),
        total,
    };
}

/**
 * Get subscription IDs for notifications
 * (subscribers with notifications enabled for a channel)
 */
export async function getSubscribersForNotification(
    channelId: string
): Promise<string[]> {
    const subscriptions = await prisma.subscription.findMany({
        where: {
            channelId,
            notificationsEnabled: true,
        },
        select: { subscriberId: true },
    });

    return subscriptions.map((sub) => sub.subscriberId);
}

/**
 * Check if a user is subscribed to a channel
 */
export async function isSubscribed(
    subscriberId: string,
    channelId: string
): Promise<boolean> {
    const subscription = await getSubscription(subscriberId, channelId);
    return !!subscription;
}

/**
 * Get count of subscriptions for a user
 */
export async function getUserSubscriptionCount(
    subscriberId: string
): Promise<number> {
    return prisma.subscription.count({
        where: { subscriberId },
    });
}

/**
 * Get subscriber count for a channel
 */
export async function getChannelSubscriberCount(
    channelId: string
): Promise<number> {
    return prisma.subscription.count({
        where: { channelId },
    });
}
