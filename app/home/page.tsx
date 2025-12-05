"use client";

import { useState } from "react";
import YouTubeHeader from "@/components/layout/Header";
import YouTubeSidebar from "@/components/layout/Sidebar";
import FilterChips from "@/components/layout/FilterChips";
import VideoCard from "@/components/video/VideoCard";

// Realistic dummy data with real images from Unsplash
const mockVideos = [
    {
        id: "1",
        title: "Building a Full Stack App with Next.js 14 - Complete Tutorial",
        channelName: "Web Dev Simplified",
        thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop",
        views: 245000,
        uploadDate: new Date("2024-11-20"),
        duration: 1847, // 30:47
    },
    {
        id: "2",
        title: "10 JavaScript Tips Every Developer Should Know",
        channelName: "Fireship",
        thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=225&fit=crop",
        views: 892000,
        uploadDate: new Date("2024-11-25"),
        duration: 623, // 10:23
    },
    {
        id: "3",
        title: "React Server Components Explained in 100 Seconds",
        channelName: "Fireship",
        thumbnail: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400&h=225&fit=crop",
        views: 567000,
        uploadDate: new Date("2024-12-01"),
        duration: 102, // 1:42
    },
    {
        id: "4",
        title: "CSS Grid vs Flexbox - When to Use Each One?",
        channelName: "Kevin Powell",
        thumbnail: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=400&h=225&fit=crop",
        views: 423000,
        uploadDate: new Date("2024-11-28"),
        duration: 1245, // 20:45
    },
    {
        id: "5",
        title: "I Built a YouTube Clone in 24 Hours - Here's What I Learned",
        channelName: "Theo - t3.gg",
        thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop",
        views: 178000,
        uploadDate: new Date("2024-12-02"),
        duration: 2156, // 35:56
    },
    {
        id: "6",
        title: "TypeScript 5.0 - New Features Explained",
        channelName: "Matt Pocock",
        thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=225&fit=crop",
        views: 312000,
        uploadDate: new Date("2024-11-22"),
        duration: 892, // 14:52
    },
    {
        id: "7",
        title: "Master Tailwind CSS in 2024 - Complete Course",
        channelName: "Traversy Media",
        thumbnail: "https://images.unsplash.com/photo-1523726491678-bf852e717f6a?w=400&h=225&fit=crop",
        views: 654000,
        uploadDate: new Date("2024-11-18"),
        duration: 3421, // 57:01
    },
    {
        id: "8",
        title: "Understanding React Hooks - useEffect Deep Dive",
        channelName: "Jack Herrington",
        thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=225&fit=crop",
        views: 234000,
        uploadDate: new Date("2024-11-30"),
        duration: 1534, // 25:34
    },
    {
        id: "9",
        title: "My Coding Setup 2024 - Mac Studio + Gear Tour",
        channelName: "ThePrimeagen",
        thumbnail: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=400&h=225&fit=crop",
        views: 445000,
        uploadDate: new Date("2024-12-03"),
        duration: 945, // 15:45
    },
    {
        id: "10",
        title: "Database Design Mistakes You Should Avoid",
        channelName: "ByteByteGo",
        thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=225&fit=crop",
        views: 189000,
        uploadDate: new Date("2024-11-26"),
        duration: 678, // 11:18
    },
    {
        id: "11",
        title: "Python for Beginners - Full Course 2024",
        channelName: "Programming with Mosh",
        thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop",
        views: 1200000,
        uploadDate: new Date("2024-11-15"),
        duration: 7234, // 2:00:34
    },
    {
        id: "12",
        title: "Stop Using console.log() - Try This Instead",
        channelName: "Web Dev Simplified",
        thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=225&fit=crop",
        views: 567000,
        uploadDate: new Date("2024-11-29"),
        duration: 534, // 8:54
    },
    {
        id: "13",
        title: "How I Would Learn Web Development in 2024",
        channelName: "CodeWithChris",
        thumbnail: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=225&fit=crop",
        views: 823000,
        uploadDate: new Date("2024-11-21"),
        duration: 1876, // 31:16
    },
    {
        id: "14",
        title: "Docker Crash Course for Absolute Beginners",
        channelName: "TechWorld with Nana",
        thumbnail: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400&h=225&fit=crop",
        views: 445000,
        uploadDate: new Date("2024-11-24"),
        duration: 2345, // 39:05
    },
    {
        id: "15",
        title: "Building Real-Time Chat with WebSockets",
        channelName: "Traversy Media",
        thumbnail: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=225&fit=crop",
        views: 298000,
        uploadDate: new Date("2024-12-01"),
        duration: 1923, // 32:03
    },
    {
        id: "16",
        title: "AWS vs Azure vs Google Cloud - Which One to Choose?",
        channelName: "TechLead",
        thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=225&fit=crop",
        views: 678000,
        uploadDate: new Date("2024-11-19"),
        duration: 1234, // 20:34
    },
    {
        id: "17",
        title: "Advanced Git Techniques You Should Know",
        channelName: "Fireship",
        thumbnail: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&h=225&fit=crop",
        views: 534000,
        uploadDate: new Date("2024-11-27"),
        duration: 456, // 7:36
    },
    {
        id: "18",
        title: "API Design Best Practices - REST vs GraphQL",
        channelName: "Hussein Nasser",
        thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=225&fit=crop",
        views: 267000,
        uploadDate: new Date("2024-11-23"),
        duration: 1678, // 27:58
    },
    {
        id: "19",
        title: "My Morning Routine as a Software Engineer",
        channelName: "Forrest Knight",
        thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=225&fit=crop",
        views: 156000,
        uploadDate: new Date("2024-12-04"),
        duration: 723, // 12:03
    },
    {
        id: "20",
        title: "JavaScript Array Methods Explained - Map, Filter, Reduce",
        channelName: "Ania Kubów",
        thumbnail: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=225&fit=crop",
        views: 412000,
        uploadDate: new Date("2024-11-17"),
        duration: 1456, // 24:16
    },
];

export default function HomePage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("All");

    return (
        <div className="min-h-screen">
            <YouTubeHeader onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

            <div className="hidden lg:block">
                <YouTubeSidebar collapsed={sidebarCollapsed} />
            </div>

            {/* Main Content */}
            <main className={`pt-14 transition-all duration-200 ${sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-60"
                }`}>
                {/* Filter Chips */}
                <FilterChips selected={selectedFilter} onSelect={setSelectedFilter} />

                {/* Video Grid */}
                <div className="p-4 md:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-10">
                        {mockVideos.map((video) => (
                            <VideoCard key={video.id} {...video} />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
