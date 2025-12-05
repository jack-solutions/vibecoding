import {
    searchVideos,
    searchChannels,
    getCategories,
} from "@vc-yt-clone/db";

// ============================================
// Types
// ============================================

export interface SearchFilters {
    query: string;
    type?: "video" | "channel" | "all";
    category?: string;
    uploadDate?: "hour" | "today" | "week" | "month" | "year";
    duration?: "short" | "medium" | "long";
    sortBy?: "relevance" | "date" | "views" | "rating";
    limit?: number;
    offset?: number;
}

export interface SearchResult {
    videos: {
        items: any[];
        total: number;
    };
    channels: {
        items: any[];
        total: number;
    };
    categories: {
        name: string;
        count: number;
    }[];
    filters: {
        query: string;
        type: string;
        category?: string;
        uploadDate?: string;
        duration?: string;
        sortBy: string;
    };
    pagination: {
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

export interface VideoSearchResult {
    items: any[];
    total: number;
    pagination: {
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

export interface ChannelSearchResult {
    items: any[];
    total: number;
    pagination: {
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

// ============================================
// Search Service Functions
// ============================================

/**
 * Unified search across videos and channels
 */
export async function search(filters: SearchFilters): Promise<SearchResult> {
    const {
        query,
        type = "all",
        category,
        sortBy = "relevance",
        limit = 20,
        offset = 0,
    } = filters;

    const searchResults: SearchResult = {
        videos: { items: [], total: 0 },
        channels: { items: [], total: 0 },
        categories: [],
        filters: {
            query,
            type,
            category,
            uploadDate: filters.uploadDate,
            duration: filters.duration,
            sortBy,
        },
        pagination: {
            limit,
            offset,
            hasMore: false,
        },
    };

    // Search videos if type is "video" or "all"
    if (type === "video" || type === "all") {
        const videoSortBy = sortBy === "rating" ? "views" : sortBy;
        const videoResults = await searchVideos(query, {
            limit: type === "all" ? Math.ceil(limit / 2) : limit,
            offset: type === "all" ? 0 : offset,
            category,
            sortBy: videoSortBy as "relevance" | "date" | "views",
        });

        searchResults.videos = {
            items: videoResults.videos.map((video) => ({
                ...video,
                resultType: "video",
            })),
            total: videoResults.total,
        };
    }

    // Search channels if type is "channel" or "all"
    if (type === "channel" || type === "all") {
        const channelLimit = type === "all" ? Math.ceil(limit / 2) : limit;
        const channelOffset = type === "all" ? 0 : offset;

        const channelResults = await searchChannels(
            query,
            channelLimit,
            channelOffset
        );

        // Note: searchChannels doesn't return total, so we estimate based on results
        searchResults.channels = {
            items: channelResults.map((channel) => ({
                ...channel,
                resultType: "channel",
            })),
            total: channelResults.length,
        };
    }

    // Get categories for filtering
    const categories = await getCategories();
    searchResults.categories = categories;

    // Calculate if there are more results
    const totalResults = searchResults.videos.total + searchResults.channels.total;
    searchResults.pagination.hasMore = offset + limit < totalResults;

    return searchResults;
}

/**
 * Search only videos with advanced filters
 */
export async function searchVideosAdvanced(
    filters: SearchFilters
): Promise<VideoSearchResult> {
    const {
        query,
        category,
        sortBy = "relevance",
        limit = 20,
        offset = 0,
    } = filters;

    const results = await searchVideos(query, {
        limit,
        offset,
        category,
        sortBy: sortBy === "rating" ? "views" : (sortBy as "relevance" | "date" | "views"),
    });

    return {
        items: results.videos,
        total: results.total,
        pagination: {
            limit,
            offset,
            hasMore: offset + limit < results.total,
        },
    };
}

/**
 * Search only channels
 */
export async function searchChannelsOnly(
    query: string,
    limit: number = 20,
    offset: number = 0
): Promise<ChannelSearchResult> {
    const results = await searchChannels(query, limit, offset);

    return {
        items: results,
        total: results.length,
        pagination: {
            limit,
            offset,
            hasMore: results.length === limit,
        },
    };
}

/**
 * Get search suggestions based on partial query
 */
export async function getSearchSuggestions(
    query: string,
    limit: number = 5
): Promise<string[]> {
    if (!query || query.length < 2) {
        return [];
    }

    // Get video titles that match the query
    const videoResults = await searchVideos(query, {
        limit,
        offset: 0,
        sortBy: "views",
    });

    // Extract unique title suggestions
    const suggestions = videoResults.videos
        .map((v) => v.title)
        .filter((title, index, self) => self.indexOf(title) === index)
        .slice(0, limit);

    return suggestions;
}

/**
 * Get available filter options
 */
export async function getFilterOptions() {
    const categories = await getCategories();

    return {
        types: [
            { value: "all", label: "All" },
            { value: "video", label: "Videos" },
            { value: "channel", label: "Channels" },
        ],
        uploadDates: [
            { value: "hour", label: "Last hour" },
            { value: "today", label: "Today" },
            { value: "week", label: "This week" },
            { value: "month", label: "This month" },
            { value: "year", label: "This year" },
        ],
        durations: [
            { value: "short", label: "Under 4 minutes" },
            { value: "medium", label: "4-20 minutes" },
            { value: "long", label: "Over 20 minutes" },
        ],
        sortOptions: [
            { value: "relevance", label: "Relevance" },
            { value: "date", label: "Upload date" },
            { value: "views", label: "View count" },
            { value: "rating", label: "Rating" },
        ],
        categories: categories.map((c) => ({
            value: c.name,
            label: c.name,
            count: c.count,
        })),
    };
}
