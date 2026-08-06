import { useState, useEffect, useCallback } from "react";
import { getComments, addComment, toggleLikeComment, togglePinComment, deleteComment, editComment } from "@/actions/comments";
import { CommentItem, type CommentData } from "./CommentItem";

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: number;
  viewerId: number | null;
  showCommentsPublicly?: boolean;
  allowNewComments?: boolean;
}

export function CommentsModal({
  isOpen,
  onClose,
  profileId,
  viewerId,
  showCommentsPublicly = true,
  allowNewComments = true
}: CommentsModalProps) {
  const [filter, setFilter] = useState("Newest first");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);
  const [commentText, setCommentText] = useState("");

  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const isPreview = viewerId === -1;

  // Render-time adjustment: reset page + show loading when modal opens
  // This avoids the lint rule which flags synchronous setState inside effects
  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (prevOpen !== isOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      setPage(1);
      setIsLoading(true);
    }
  }

  const fetchComments = useCallback(async (pageNum: number = 1) => {
    const res = await getComments(profileId, pageNum, 10, filter);
    if (res.success && res.comments) {
      const fetched = res.comments as unknown as CommentData[];
      if (pageNum === 1) {
        setComments(fetched);
      } else {
        setComments(prev => {
          const newComments = fetched.filter(c => !prev.some(p => p.id === c.id));
          return [...prev, ...newComments];
        });
      }
      setHasMore(res.hasMore || false);
    }

    if (pageNum === 1) setIsLoading(false);
    if (pageNum > 1) setIsLoadingMore(false);
  }, [profileId, filter]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShouldRender(true), 0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsAnimating(true));
      });
    } else {
      requestAnimationFrame(() => setIsAnimating(false));
      const timer = setTimeout(() => setShouldRender(false), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Load comments on open, filter change, and page increment. All setState
  // calls happen after the `await getComments()` — they are not synchronous —
  // but the compiler rule can't prove that through the useCallback boundary.
  useEffect(() => {
    if (!isOpen || isPreview) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchComments(page);
  }, [isOpen, page, fetchComments, isPreview]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (hasMore && !isLoadingMore && !isLoading) {
        // Throttle: flip the loading flag synchronously so rapid scroll events
        // can't increment the page multiple times before the effect runs.
        setIsLoadingMore(true);
        setPage(p => p + 1);
      }
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    
    const textToPost = commentText;
    setCommentText("");
    
    const optimisticAuthor = comments.find(c => c.authorId === viewerId)?.author || {
      username: "you",
      displayName: "Posting...",
      avatarUrl: null,
      avatarShape: "circle" as const
    };

    const tempId = -Date.now();
    const optimisticComment: CommentData = {
      id: tempId,
      content: textToPost,
      createdAt: new Date(),
      isPinned: false,
      likesCount: 0,
      authorId: viewerId || 0,
      isLiked: false,
      author: optimisticAuthor
    };

    setComments(prev => {
      const updated = [...prev, optimisticComment];
      if (filter === "Oldest first") {
        updated.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      } else if (filter === "Most liked") {
        updated.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
      } else {
        updated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      updated.sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1));
      return updated;
    });

    addComment(profileId, textToPost).then(res => {
      if (res.success && res.comment) {
        setComments(prev => prev.map(c => 
          c.id === tempId ? { ...res.comment, isLiked: false } as unknown as CommentData : c
        ));
      } else {
        setComments(prev => prev.filter(c => c.id !== tempId));
      }
    }).catch(() => {
      setComments(prev => prev.filter(c => c.id !== tempId));
    });
  };

  const handleLike = async (id: number) => {
    // Optimistic UI update
    setComments(prev => prev.map(c => 
      c.id === id 
        ? { ...c, isLiked: !c.isLiked, likesCount: c.isLiked ? Math.max(0, c.likesCount - 1) : c.likesCount + 1 } 
        : c
    ));
    // Background server call
    toggleLikeComment(id).catch(() => {
      // Silently fail or revert
    });
  };

  const handlePin = async (id: number) => {
    // Optimistic UI update
    setComments(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, isPinned: !c.isPinned } : c);
      
      // Secondary sort based on current filter
      if (filter === "Oldest first") {
        updated.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      } else if (filter === "Most liked") {
        updated.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
      } else {
        // Default: Newest first
        updated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      // Primary sort: pinned comments stay on top
      updated.sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1));
      
      return updated;
    });
    togglePinComment(id, profileId).catch(() => {
      // Error
    });
  };

  const handleDelete = async (id: number) => {
    setComments(prev => prev.filter(c => c.id !== id && c.replyToId !== id));
    deleteComment(id, profileId).catch(() => {
      // Error
    });
  };

  const handlePostReply = async (replyToId: number, content: string) => {
    if (!content.trim()) return;
    
    const optimisticAuthor = comments.find(c => c.authorId === viewerId)?.author || {
      username: "you",
      displayName: "Posting...",
      avatarUrl: null,
      avatarShape: "circle" as const
    };

    const tempId = -Date.now();
    const optimisticComment: CommentData = {
      id: tempId,
      content: content,
      createdAt: new Date(),
      isPinned: false,
      likesCount: 0,
      authorId: viewerId || 0,
      isLiked: false,
      replyToId: replyToId,
      author: optimisticAuthor
    };

    setComments(prev => [...prev, optimisticComment]);

    addComment(profileId, content, replyToId).then(res => {
      if (res.success && res.comment) {
        setComments(prev => prev.map(c => 
          c.id === tempId ? { ...res.comment, isLiked: false } as unknown as CommentData : c
        ));
      } else {
        setComments(prev => prev.filter(c => c.id !== tempId));
      }
    }).catch(() => {
      setComments(prev => prev.filter(c => c.id !== tempId));
    });
  };

  const handleEdit = (id: number, newContent: string) => {
    const current = comments.find(c => c.id === id);
    if (!current) return;
    if (newContent && newContent.trim() !== current.content) {
      setComments(prev => prev.map(c => c.id === id ? { ...c, content: newContent } : c));
      editComment(id, newContent).catch(() => {
        // Error
      });
    }
  };

  if (!shouldRender) return null;

  const canViewAll = showCommentsPublicly || viewerId === profileId;
  const visibleComments = canViewAll ? comments : comments.filter(c => c.authorId === viewerId);
  const topLevelComments = visibleComments.filter(c => !c.replyToId);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`}
        onClick={() => {
          setIsAnimating(false);
          setTimeout(onClose, 300);
        }}
      />
      
      <div 
        className={`absolute top-[88px] right-6 z-[100] w-[400px] max-w-[calc(100vw-3rem)] bg-[#0c0c0c] border border-white/5 rounded-[24px] shadow-2xl flex flex-col overflow-hidden origin-top-right transition-all duration-100 ease-out ${
          isAnimating ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2"
        }`}
      >
        {/* Header */}
        <div className="flex flex-col border-b border-white/5">
          <div className="flex items-center justify-between p-4 pb-2">
            <h2 className="text-[18px] font-semibold text-white tracking-tight">Comments</h2>
            <button 
              onClick={() => {
                setIsAnimating(false);
                setTimeout(onClose, 300);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white focus:outline-none"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className="flex items-center justify-between px-4 pb-4">
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-[13px] font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors border border-white/5 focus:outline-none"
              >
                {filter}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                  <polyline points="7 10 12 15 17 10"></polyline>
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-40 bg-[#161616] border border-white/10 rounded-xl shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in duration-200">
                  <button 
                    className="w-full text-left px-4 py-2.5 text-[13px] text-white/70 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
                    onClick={() => { setFilter("Newest first"); setPage(1); setIsLoading(true); setIsDropdownOpen(false); }}
                  >
                    Newest first
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2.5 text-[13px] text-white/70 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
                    onClick={() => { setFilter("Oldest first"); setPage(1); setIsLoading(true); setIsDropdownOpen(false); }}
                  >
                    Oldest first
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2.5 text-[13px] text-white/70 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
                    onClick={() => { setFilter("Most liked"); setPage(1); setIsLoading(true); setIsDropdownOpen(false); }}
                  >
                    Most liked
                  </button>
                </div>
              )}
            </div>
            
            <span className="text-[13px] text-white/40">{visibleComments.length}</span>
          </div>
        </div>

        {/* Body */}
        <div 
          className="flex-1 overflow-y-auto max-h-[400px] flex flex-col p-4 pt-0 gap-2"
          onScroll={handleScroll}
        >
          {isPreview ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-[14px] font-thin text-white/50 text-center">
                Comments are hidden in preview mode — save your changes to view them.
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-[#5b6cf5] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : topLevelComments.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-[14px] font-thin text-white/50 text-center">
                {canViewAll ? "No comments yet — be the first to leave one." : "Comments are private on this profile."}
              </p>
            </div>
          ) : (
            <>
              {topLevelComments.map((comment) => (
                <CommentItem 
                  key={comment.id}
                  comment={comment}
                  viewerId={viewerId}
                  profileId={profileId}
                  allComments={visibleComments}
                  onLike={handleLike}
                  onPin={handlePin}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onPostReply={handlePostReply}
                  allowNewComments={allowNewComments}
                />
              ))}
              {isLoadingMore && (
                <div className="flex items-center justify-center py-4">
                  <div className="w-4 h-4 border-2 border-[#5b6cf5] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Input */}
        <div className="p-4 border-t border-white/5 bg-[#0a0a0a]">
          {!viewerId ? (
            <button 
              onClick={() => window.location.href = "/signin"}
              className="w-full py-3 bg-[#5b6cf5]/10 hover:bg-[#5b6cf5]/20 border border-[#5b6cf5]/20 text-[#5b6cf5] rounded-full text-[14px] font-medium transition-colors"
            >
              Log in to leave a comment
            </button>
          ) : viewerId === -1 ? (
            <div className="w-full py-2 text-white/40 text-[13px] text-center">
              Not available in preview mode
            </div>
          ) : !allowNewComments && viewerId !== profileId ? (
            <div className="w-full py-2 text-white/40 text-[13px] text-center">
              New comments are turned off for this profile.
            </div>
          ) : (
            <div className="group relative flex items-center bg-[#161616] border border-white/5 rounded-full px-4 py-2 transition-colors focus-within:border-[#5b6cf5] focus-within:bg-[#1a1a1a]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-white/40 group-focus-within:text-[#5b6cf5] transition-colors mr-3 shrink-0">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
            <input 
              id="comment-input"
              type="text" 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handlePostComment();
                }
              }}
              placeholder="Write a comment..." 
              className="w-full bg-transparent text-[14px] text-white placeholder-white/30 focus:outline-none"
            />
            <button 
              onClick={handlePostComment}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 ml-2 focus:outline-none ${
                commentText.trim().length > 0 
                  ? "bg-[#5b6cf5] hover:bg-[#4a58c9] text-white" 
                  : "bg-white/20 hover:bg-white/30 text-white/50"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
          )}
        </div>
      </div>
    </>
  );
}
