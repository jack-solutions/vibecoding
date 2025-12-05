"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import CommentInput from "./CommentInput";
import CommentItem from "./CommentItem";

interface CommentSectionProps {
    videoId: string;
}

export default function CommentSection({ videoId }: CommentSectionProps) {
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState<"top" | "newest">("top");
    const [commentCount, setCommentCount] = useState(0);

    useEffect(() => {
        fetchComments();
    }, [videoId, sort]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/comments?videoId=${videoId}&sort=${sort}`);
            const data = await res.json();

            if (data.success) {
                setComments(data.data.comments);
                setCommentCount(data.data.total);
            }
        } catch (err) {
            console.error("Error fetching comments:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-6">
            {/* Header */}
            <div className="flex items-center gap-8 mb-6">
                <h2 className="text-xl font-medium">
                    {commentCount} {commentCount === 1 ? "Comment" : "Comments"}
                </h2>

                {/* Sort */}
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={sort === "top" ? "font-medium" : ""}
                        onClick={() => setSort("top")}
                    >
                        Top comments
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={sort === "newest" ? "font-medium" : ""}
                        onClick={() => setSort("newest")}
                    >
                        Newest first
                    </Button>
                </div>
            </div>

            {/* Add Comment */}
            <CommentInput videoId={videoId} onCommentAdded={fetchComments} />

            {/* Comments List */}
            {loading ? (
                <div className="py-8 text-center text-muted-foreground">
                    Loading comments...
                </div>
            ) : comments.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                    No comments yet. Be the first to comment!
                </div>
            ) : (
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment._id}
                            comment={comment}
                            onReplyAdded={fetchComments}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
