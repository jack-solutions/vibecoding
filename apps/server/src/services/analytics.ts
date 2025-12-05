import {
    getVideoAnalytics,
    getChannelAnalytics,
    type TimeRange,
} from "@vc-yt-clone/db";

// ============================================
// Helpers
// ============================================

export function parseTimeRange(
    period: string = "28d",
    customStart?: string,
    customEnd?: string
): TimeRange {
    const endDate = customEnd ? new Date(customEnd) : new Date();
    let startDate = customStart ? new Date(customStart) : new Date();

    if (!customStart) {
        // Calculate start date based on period
        switch (period) {
            case "7d":
                startDate.setDate(endDate.getDate() - 7);
                break;
            case "28d":
                startDate.setDate(endDate.getDate() - 28);
                break;
            case "90d":
                startDate.setDate(endDate.getDate() - 90);
                break;
            case "365d":
                startDate.setDate(endDate.getDate() - 365);
                break;
            case "lifetime":
                startDate = new Date(0); // Beginning of time (or platform launch)
                break;
            default:
                // Default to 28 days
                startDate.setDate(endDate.getDate() - 28);
        }
    }

    return { startDate, endDate };
}

// ============================================
// Service Functions
// ============================================

export { getVideoAnalytics, getChannelAnalytics };
