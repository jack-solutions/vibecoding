"use client";

import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface VideoActionsProps {
    likes: number;
    dislikes: number;
    onLike?: () => void;
    onDislike?: () => void;
}

export default function VideoActions({ likes, dislikes, onLike, onDislike }: VideoActionsProps) {
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);

    const handleLike = () => {
        if (disliked) setDisliked(false);
        setLiked(!liked);
        onLike?.();
    };

    const handleDislike = () => {
        if (liked) setLiked(false);
        setDisliked(!disliked);
        onDislike?.();
    };

    return (
        <div className="flex items-center gap-2">
            {/* Like/Dislike Group */}
            <div className="flex items-center bg-[#303030] rounded-full overflow-hidden">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 hover:bg-[#3f3f3f] transition-colors ${liked ? "text-white" : ""
                        }`}
                >
                    <ThumbsUp className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                    <span className="text-sm font-medium">{likes.toLocaleString()}</span>
                </button>

                <div className="w-px h-6 bg-[#515151]" />

                <button
                    onClick={handleDislike}
                    className={`flex items-center px-4 py-2 hover:bg-[#3f3f3f] transition-colors ${disliked ? "text-white" : ""
                        }`}
                >
                    <ThumbsDown className={`w-5 h-5 ${disliked ? "fill-current" : ""}`} />
                </button>
            </div>

            {/* Share */}
            <Button variant="secondary" className="rounded-full bg-[#303030] hover:bg-[#3f3f3f]">
                <Share2 className="w-5 h-5 mr-2" />
                Share
            </Button>

            {/* Download */}
            <Button variant="secondary" className="rounded-full bg-[#303030] hover:bg-[#3f3f3f]">
                <Download className="w-5 h-5 mr-2" />
                Download
            </Button>

            {/* More */}
            <Button variant="secondary" size="icon" className="rounded-full bg-[#303030] hover:bg-[#3f3f3f]">
                <MoreHorizontal className="w-5 h-5" />
            </Button>
        </div>
    );
}
