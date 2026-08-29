import React from "react";
import Image from "next/image";
import { format } from "date-fns";

export interface CommentData {
  id: number;
  content: string;
  createdAt: Date;
  isPinned: boolean;
  likesCount: number;
  authorId: number;
  author: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    avatarShape: "square" | "soft" | "rounded" | "circle" | null;
  };
  isLiked?: boolean;
  replyToId?: number | null;
}

interface CommentItemProps {
  comment: CommentData;
  viewerId: number | null;
  profileId: number;
  allComments: CommentData[];
  onLike: (id: number) => void;
  onPostReply: (replyToId: number, content: string) => void;
  onPin: (id: number) => void;
  onEdit: (id: number, newContent: string) => void;
  onDelete: (id: number) => void;
  allowNewComments: boolean;
}

export function CommentItem({
  comment,
  viewerId,
  profileId,
  allComments,
  onLike,
  onPostReply,
  onPin,
  onEdit,
  onDelete,
  allowNewComments,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(comment.content);
  const [isReplying, setIsReplying] = React.useState(false);
  const [replyContent, setReplyContent] = React.useState("");
  const [showReplies, setShowReplies] = React.useState(false);

  const isProfileOwner = viewerId === profileId;
  const isCommentAuthor = viewerId === comment.authorId;
  const isNested = comment.replyToId != null;

  const isChatOpen = allowNewComments || isProfileOwner;

  const canPin = isProfileOwner && !isNested;
  const canEdit = isCommentAuthor && isChatOpen;
  const canDelete = isProfileOwner || (isCommentAuthor && isChatOpen);
  const canReply = !isNested && isChatOpen;
  
  const replies = allComments.filter(c => c.replyToId === comment.id);
  const sortedReplies = [...replies].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const handlePostReply = () => {
    if (!replyContent.trim()) return;
    onPostReply(comment.id, replyContent);
    setReplyContent("");
    setIsReplying(false);
    setShowReplies(true);
  };

  const getBorderRadius = (shape: string | null) => {
    switch (shape) {
      case "circle": return "rounded-full";
      case "square": return "rounded-none";
      case "soft": return "rounded-md";
      case "rounded": return "rounded-xl";
      default: return "rounded-full";
    }
  };

  const formattedDate = format(new Date(comment.createdAt), "MM/dd/yyyy, hh:mm a");

  return (
    <div className="w-full flex flex-col">
      <div className={`group relative flex transition-colors w-full ${isNested ? "gap-2.5 px-0 py-1" : "gap-3 px-4 py-3"}`}>
      <div className="shrink-0 pt-1">
        {comment.author.avatarUrl ? (
          <Image
            src={comment.author.avatarUrl}
            alt={comment.author.displayName || comment.author.username}
            width={isNested ? 24 : 32}
            height={isNested ? 24 : 32}
            className={`object-cover ${isNested ? "w-6 h-6" : "w-8 h-8"} ${getBorderRadius(comment.author.avatarShape)}`}
          />
        ) : (
          <div className={`${isNested ? "w-6 h-6 text-[11px]" : "w-8 h-8 text-[14px]"} bg-white/10 flex items-center justify-center text-white/50 ${getBorderRadius(comment.author.avatarShape)}`}>
            {(comment.author.displayName || comment.author.username)[0].toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`${isNested ? "text-[13px]" : "text-[14px]"} font-light text-white/90 truncate`}>
            {comment.author.displayName || comment.author.username}
          </span>
          <span className={`${isNested ? "text-[11px]" : "text-[12px]"} font-thin text-white/40 shrink-0`}>
            {formattedDate}
          </span>
          
          {comment.isPinned && (
            <svg width="12" height="12" viewBox="0 0 384 512" fill="currentColor" className="text-[#5b6cf5] ml-1 shrink-0 -rotate-45 transform origin-center overflow-visible">
              <path d="M32 32C32 14.3 46.3 0 64 0H320c17.7 0 32 14.3 32 32s-14.3 32-32 32H290.5l11.4 148.2c36.7 19.9 65.7 53.2 79.5 93l.2 1.4c2.2 11.2-1.2 22.8-9 31.1S355.6 352 344 352H208v128c0 17.7-14.3 32-32 32s-32-14.3-32-32V352H40c-11.6 0-22.5-5.3-30.2-14.3s-11.2-19.9-9-31.1l.2-1.4c13.8-39.8 42.8-73.1 79.5-93L93.5 64H64C46.3 64 32 49.7 32 32z"/>
            </svg>
          )}
        </div>

        {isEditing ? (
          <div className="mt-1 flex items-center bg-[#161616] border border-white/5 rounded-[12px] px-3 py-1.5 focus-within:border-white/10 transition-colors w-full">
            <input 
              type="text" 
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="bg-transparent border-none outline-none text-[13px] font-thin text-white w-full placeholder-white/30"
              placeholder="Edit comment..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsEditing(false);
                  onEdit(comment.id, editContent);
                } else if (e.key === "Escape") {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }
              }}
            />
            <button 
              onClick={() => {
                setIsEditing(false);
                onEdit(comment.id, editContent);
              }}
              className="ml-2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shrink-0 focus:outline-none"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
          </div>
        ) : (
          <p className={`${isNested ? "text-[13px]" : "text-[14px]"} font-thin text-white/80 leading-relaxed whitespace-pre-wrap break-words mt-0.5`}>
            {comment.content}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-1 pt-1 ml-auto self-start shrink-0">
        
        <button onClick={() => onLike(comment.id)} className={`flex items-center justify-center transition-colors focus:outline-none gap-1.5 ${comment.isLiked ? 'text-[#ff4b4b]' : 'text-white/40 hover:text-white'}`} title={comment.isLiked ? "Unlike" : "Like"}>
          <svg width="11" height="11" viewBox="0 0 512 512" fill="currentColor">
            <path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/>
          </svg>
          {comment.likesCount > 0 && <span className="text-[12px] font-medium leading-none">{comment.likesCount}</span>}
        </button>

        {canReply && (
          <button onClick={() => setIsReplying(!isReplying)} className="w-4 h-4 flex items-center justify-center text-white/40 hover:text-white transition-colors focus:outline-none" title="Reply">
            <svg width="11" height="11" viewBox="0 0 512 512" fill="currentColor">
              <path d="M8.309 189.836L184.313 37.851C199.719 24.546 224 35.347 224 56.015v80.053c160.629 1.839 288 34.032 288 186.258 0 61.441-39.581 122.309-83.333 154.132-13.653 9.931-33.111-2.533-28.077-18.631 45.344-145.012-21.507-183.51-176.59-185.742V360c0 20.7-24.3 31.453-39.687 18.164l-176.004-152c-11.07-9.562-11.086-26.753 0-36.328z"/>
            </svg>
          </button>
        )}

        {canPin && (
          <button onClick={() => onPin(comment.id)} className={`w-4 h-4 flex items-center justify-center transition-colors focus:outline-none ${comment.isPinned ? "text-[#5b6cf5] hover:text-[#4a58c9]" : "text-white/40 hover:text-white"}`} title={comment.isPinned ? "Unpin" : "Pin"}>
            <svg width="12" height="12" viewBox="0 0 384 512" fill="currentColor" className="-rotate-45 transform origin-center overflow-visible">
              <path d="M32 32C32 14.3 46.3 0 64 0H320c17.7 0 32 14.3 32 32s-14.3 32-32 32H290.5l11.4 148.2c36.7 19.9 65.7 53.2 79.5 93l.2 1.4c2.2 11.2-1.2 22.8-9 31.1S355.6 352 344 352H208v128c0 17.7-14.3 32-32 32s-32-14.3-32-32V352H40c-11.6 0-22.5-5.3-30.2-14.3s-11.2-19.9-9-31.1l.2-1.4c13.8-39.8 42.8-73.1 79.5-93L93.5 64H64C46.3 64 32 49.7 32 32z"/>
            </svg>
          </button>
        )}

        {canEdit && (
          isEditing ? (
            <button onClick={() => { setIsEditing(false); setEditContent(comment.content); }} className="w-4 h-4 flex items-center justify-center text-white/40 hover:text-white transition-colors focus:outline-none" title="Cancel Edit">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="w-4 h-4 flex items-center justify-center text-white/40 hover:text-white transition-colors focus:outline-none" title="Edit">
              <svg width="11" height="11" viewBox="0 0 512 512" fill="currentColor">
                <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"/>
              </svg>
            </button>
          )
        )}

        {canDelete && (
          <button onClick={() => onDelete(comment.id)} className="w-4 h-4 flex items-center justify-center text-white/40 hover:text-red-500 transition-colors focus:outline-none" title="Delete">
            <svg width="11" height="11" viewBox="0 0 448 512" fill="currentColor">
              <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/>
            </svg>
          </button>
        )}
      </div>
      </div>
      
      {isReplying && (
        <div className="ml-[60px] mr-4 mb-2 relative mt-[-10px] z-10">
          <div className="absolute left-[-28px] top-0 bottom-0 w-[1px] bg-white/10" />
          <div className="flex items-center bg-[#161616] border border-white/5 rounded-full px-4 py-2 focus-within:border-[#5b6cf5] focus-within:bg-[#1a1a1a] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-white/40 mr-2 shrink-0">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
            <input 
              type="text" 
              autoFocus
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handlePostReply();
                if (e.key === "Escape") setIsReplying(false);
              }}
              placeholder="Write a reply..."
              className="flex-1 bg-transparent border-none outline-none text-[14px] text-white placeholder:text-white/30"
            />
            {replyContent.trim().length > 0 && (
              <button onClick={handlePostReply} className="ml-2 w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#5b6cf5] text-white transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="translate-x-[1px] translate-y-[1px]">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {sortedReplies.length > 0 && (
        <div className="ml-[60px] mb-2 flex flex-col relative mt-[-10px] z-10">
          <button 
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-2 text-[12px] font-thin text-white/40 hover:text-white transition-colors py-1 self-start"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${showReplies ? "rotate-180" : ""}`}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            {showReplies ? `Hide ${sortedReplies.length} replies` : `Show ${sortedReplies.length} replies`}
          </button>
          
          {showReplies && (
            <div className="flex flex-col gap-0 mt-1 relative">
              <div className="absolute left-[-28px] top-0 bottom-2 w-[1px] bg-white/10" />
              {sortedReplies.map(reply => (
                <CommentItem 
                  key={reply.id}
                  comment={reply}
                  viewerId={viewerId}
                  profileId={profileId}
                  allComments={allComments}
                  onLike={onLike}
                  onPostReply={onPostReply}
                  onPin={onPin}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  allowNewComments={allowNewComments}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
