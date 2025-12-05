"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const filters = [
    "All",
    "Music",
    "Gaming",
    "News",
    "Live",
    "Podcasts",
    "Recently uploaded",
    "Watched",
    "New to you",
];

interface FilterChipsProps {
    selected?: string;
    onSelect?: (filter: string) => void;
}

export default function FilterChips({ selected = "All", onSelect }: FilterChipsProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 200;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="relative flex items-center border-b border-border bg-background">
            {/* Left scroll button */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 z-10 yt-icon-button bg-background"
                onClick={() => scroll("left")}
            >
                <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* Filter chips */}
            <div
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto scrollbar-hide px-12 py-3"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {filters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => onSelect?.(filter)}
                        className={cn(
                            "yt-chip",
                            selected === filter && "yt-chip-active"
                        )}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Right scroll button */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 z-10 yt-icon-button bg-background"
                onClick={() => scroll("right")}
            >
                <ChevronRight className="w-5 h-5" />
            </Button>
        </div>
    );
}
