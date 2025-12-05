// Format duration from seconds to MM:SS or HH:MM:SS
export function formatDuration(seconds: number): string {
    if (!seconds || seconds < 0) return "0:00";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${minutes}:${String(secs).padStart(2, "0")}`;
}

// Format view count (1234567 => "1.2M views")
export function formatViewCount(views: number): string {
    if (!views || views < 0) return "0 views";

    if (views < 1000) {
        return `${views} views`;
    } else if (views < 1000000) {
        return `${(views / 1000).toFixed(1)}K views`;
    } else if (views < 1000000000) {
        return `${(views / 1000000).toFixed(1)}M views`;
    } else {
        return `${(views / 1000000000).toFixed(1)}B views`;
    }
}

// Format upload date (relative time)
export function formatUploadDate(date: Date): string {
    if (!date) return "Unknown";

    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) {
        return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
    } else if (diffMonths > 0) {
        return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
    } else if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else if (diffMins > 0) {
        return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    } else {
        return "Just now";
    }
}

// Format file size
export function formatFileSize(bytes: number): string {
    if (!bytes || bytes < 0) return "0 B";

    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// Mock upload video file (returns dummy data)
export async function uploadVideoFile(file: File) {
    // In production, this would upload to cloud storage (S3, Cloudinary, etc.)
    // For now, return mock data

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate upload delay

    return {
        videoUrl: `/videos/${file.name}`,
        fileSize: file.size,
        duration: Math.floor(Math.random() * 600) + 60, // Random duration 1-10 minutes
        resolution: "1920x1080",
    };
}

// Mock thumbnail generation
export async function generateThumbnail(videoUrl: string) {
    // In production, extract thumbnail from video
    // For now, return placeholder

    return `https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop`;
}
