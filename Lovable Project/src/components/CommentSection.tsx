import { useState, useEffect } from 'react';
import { ThumbsUp, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getCommentsByVideo, addComment, formatTimeAgo, type Comment } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface CommentSectionProps {
  videoId: string;
}

const CommentSection = ({ videoId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [username, setUsername] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCommentForm, setShowCommentForm] = useState(false);

  useEffect(() => {
    setComments(getCommentsByVideo(videoId));
  }, [videoId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !username.trim()) return;

    const comment = addComment(videoId, username, newComment);
    setComments([comment, ...comments]);
    setNewComment('');
    setShowCommentForm(false);
  };

  return (
    <div className="mt-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 mb-4 text-lg font-semibold hover:text-primary transition-colors"
      >
        {comments.length} Comments
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isExpanded && (
        <div className="animate-fade-up">
          {/* Add comment */}
          <div className="flex gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-semibold text-sm">
                {username ? username[0].toUpperCase() : '?'}
              </span>
            </div>
            <div className="flex-1">
              {showCommentForm ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-3 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="min-h-[80px] bg-secondary border-border focus:ring-primary/50"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowCommentForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!newComment.trim() || !username.trim()}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Comment
                    </Button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowCommentForm(true)}
                  className="w-full text-left px-3 py-2 bg-secondary rounded-lg border border-border text-muted-foreground text-sm hover:border-primary/50 transition-colors"
                >
                  Add a comment...
                </button>
              )}
            </div>
          </div>

          {/* Comments list */}
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <div
                key={comment.id}
                className={cn(
                  "flex gap-3 opacity-0 animate-fade-up",
                  `stagger-${Math.min(index + 1, 4)}`
                )}
              >
                <img
                  src={comment.avatar}
                  alt={comment.author}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 mb-2">{comment.content}</p>
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-xs">{comment.likes}</span>
                    </button>
                    <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {comments.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
