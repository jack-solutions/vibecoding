"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import CommentInput from "./CommentInput";
import { formatDistanceToNow } from "date-fns";

interface CommentItemProps {
    comment: any;
    onReplyAdded: () => void;
}

export default function CommentItem({ comment, onReplyAdded }: CommentItemProps) {
    const [showReply, setShowReply] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState<any[]>([]);
    const [loadingReplies, setLoadingReplies] = useState(false);

    const loadReplies = async () => {
        if (replies.length > 0) {
            setShowReplies(!showReplies);
            return;
        }

        setLoadingReplies(true);
        try {
            const res = await fetch(`/api/comments/${comment._id}/replies`);
            const data = await res.json();

            if (data.success) {
                setReplies(data.data.replies);
                setShowReplies(true);
            }
        } catch (err) {
            console.error("Error loading replies:", err);
        } finally {
            setLoadingReplies(false);
        }
    };

    return (
        <div className="flex gap-4">
            {/* Avatar */}
            <div className="yt-avatar w-10 h-10 flex-shrink-0">
                <span className="text-sm font-medium">
                    {comment.userId?.name?.charAt(0).toUpperCase() || "U"}
                </span>
            </div>

            {/* Comment Content */}
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                        {comment.userId?.name || "Unknown User"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                </div>

                <p className="text-sm mb-2 whitespace-pre-wrap">{comment.content}</p>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                        <ThumbsUp className="w-4 h-4" />
                        {comment.likes > 0 && (
                            <span className="ml-1 text-xs">{comment.likes}</span>
                        )}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                        <ThumbsDown className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={() => setShowReply(!showReply)}
                    >
                        Reply
                    </Button>
                </div>

                {/* Reply Input */}
                {showReply && (
                    <div className="mt-2">
                        <CommentInput
                            videoId={comment.videoId}
                            parentId={comment._id}
                            placeholder="Add a reply..."
                            autoFocus
                            onCommentAdded={() => {
                                setShowReply(false);
                                onReplyAdded();
                                setReplies([]);
                                setShowReplies(false);
                            }}
                            onCancel={() => setShowReply(false)}
                        />
                    </div>
                )}

                {/* View Replies */}
                {comment.replyCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-blue-600 h-8 px-3 text-sm font-medium"
                        onClick={loadReplies}
                        disabled={loadingReplies}
                    >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {loadingReplies
                            ? "Loading..."
                            : showReplies
                                ? "Hide replies"
                                : `View ${comment.replyCount} ${comment.replyCount === 1 ? "reply" : "replies"}`}
                    </Button>
                )}

                {/* Replies */}
                {showReplies && replies.length > 0 && (
                    <div className="mt-4 space-y-4 pl-4 border-l-2 border-border">
                        {replies.map((reply) => (
                            <CommentItem
                                key={reply._id}
                                comment={reply}
                                onReplyAdded={onReplyAdded}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
