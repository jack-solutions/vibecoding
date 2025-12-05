"use client";

import { useState } from "react";
import { useCurrentUser } from "@/lib/auth/hooks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

interface CommentInputProps {
    videoId: string;
    onCommentAdded: () => void;
    parentId?: string;
    placeholder?: string;
    autoFocus?: boolean;
    onCancel?: () => void;
}

export default function CommentInput({
    videoId,
    onCommentAdded,
    parentId,
    placeholder = "Add a comment...",
    autoFocus = false,
    onCancel,
}: CommentInputProps) {
    const { user } = useCurrentUser();
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [focused, setFocused] = useState(autoFocus);

    const handleSubmit = async () => {
        if (!content.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    videoId,
                    content: content.trim(),
                    parentId: parentId || null,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setContent("");
                setFocused(false);
                onCommentAdded();
            } else {
                alert(data.message || "Failed to post comment");
            }
        } catch (err) {
            alert("Failed to post comment");
        } finally {
            setSubmitting(false);
        }
    };

    if (!user?.isAuthenticated) {
        return (
            <div className="flex items-center gap-4 py-4">
                <div className="yt-avatar w-10 h-10">
                    <span className="text-sm">?</span>
                </div>
                <p className="text-sm text-muted-foreground">
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Sign in
                    </Link>{" "}
                    to comment
                </p>
            </div>
        );
    }

    return (
        <div className="flex gap-4 py-4">
            {/* Avatar */}
            <div className="yt-avatar w-10 h-10 flex-shrink-0">
                <span className="text-sm font-medium">
                    {user.name?.charAt(0).toUpperCase()}
                </span>
            </div>

            {/* Input */}
            <div className="flex-1">
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onFocus={() => setFocused(true)}
                    placeholder={placeholder}
                    rows={focused ? 3 : 1}
                    className="resize-none border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-blue-500"
                    autoFocus={autoFocus}
                />

                {/* Actions */}
                {focused && (
                    <div className="flex justify-end gap-2 mt-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setContent("");
                                setFocused(false);
                                onCancel?.();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSubmit}
                            disabled={!content.trim() || submitting}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                            {submitting ? "Posting..." : parentId ? "Reply" : "Comment"}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
