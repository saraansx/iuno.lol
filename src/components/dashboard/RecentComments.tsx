"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { getDashboardComments, deleteComment, toggleLikeComment, togglePinComment } from "@/actions/comments";

type CommentData = {
  id: number;
  profileId: number;
  authorId: number;
  content: string;
  isPinned: boolean;
  likesCount: number;
  replyToId: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  author: {
    id: number;
    username: string;
    avatarUrl: string | null;
  };
  isLiked: boolean;
};

interface RecentCommentsProps {
  initialReceived: CommentData[];
  initialGiven: CommentData[];
  initialReceivedHasMore?: boolean;
  initialGivenHasMore?: boolean;
  initialReceivedTotal?: number;
  initialGivenTotal?: number;
}

const PAGE_SIZE = 4;

export default function RecentComments({
  initialReceived,
  initialGiven,
  initialReceivedHasMore = false,
  initialGivenHasMore = false,
  initialReceivedTotal = 0,
  initialGivenTotal = 0,
}: RecentCommentsProps) {
  const [activeTab, setActiveTab] = useState<"received" | "given">("received");
  const [received, setReceived] = useState<CommentData[]>(initialReceived);
  const [given, setGiven] = useState<CommentData[]>(initialGiven);
  const [receivedHasMore, setReceivedHasMore] = useState(initialReceivedHasMore);
  const [givenHasMore, setGivenHasMore] = useState(initialGivenHasMore);
  const [receivedTotal, setReceivedTotal] = useState(initialReceivedTotal);
  const [givenTotal, setGivenTotal] = useState(initialGivenTotal);
  const [receivedPage, setReceivedPage] = useState(1);
  const [givenPage, setGivenPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchComments = useCallback(async (page: number, forTab: "received" | "given" = activeTab) => {
    setIsLoading(true);
    try {
      const res = await getDashboardComments(page, PAGE_SIZE);
      if (res.success) {
        if (forTab === "received") {
          setReceived(res.received as unknown as CommentData[]);
          setReceivedHasMore(!!res.receivedHasMore);
          setReceivedPage(page);
          setReceivedTotal(res.receivedTotal ?? 0);
        } else {
          setGiven(res.given as unknown as CommentData[]);
          setGivenHasMore(!!res.givenHasMore);
          setGivenPage(page);
          setGivenTotal(res.givenTotal ?? 0);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  const handleDelete = async (commentId: number, profileId: number) => {
    const isReceived = activeTab === "received";
    const currentPage = isReceived ? receivedPage : givenPage;
    const currentList = isReceived ? received : given;
    const setList = isReceived ? setReceived : setGiven;

    setList(currentList.filter(c => c.id !== commentId && c.replyToId !== commentId));
    if (isReceived) setReceivedTotal(t => Math.max(0, t - 1));
    else setGivenTotal(t => Math.max(0, t - 1));

    try {
      const res = await deleteComment(commentId, profileId);
      if (res.success) {
        if (currentList.length === 1 && currentPage > 1) {
          fetchComments(currentPage - 1, activeTab);
          return;
        }
      } else {
        fetchComments(currentPage, activeTab);
        fetchComments(isReceived ? givenPage : receivedPage, isReceived ? "given" : "received");
      }
    } catch {
      fetchComments(currentPage, activeTab);
      fetchComments(isReceived ? givenPage : receivedPage, isReceived ? "given" : "received");
    }
  };

  const handleLike = async (commentId: number) => {
    const updater = (prev: CommentData[]) => prev.map(c =>
      c.id === commentId
        ? { ...c, isLiked: !c.isLiked, likesCount: c.isLiked ? Math.max(0, c.likesCount - 1) : c.likesCount + 1 }
        : c
    );
    setReceived(updater);
    setGiven(updater);

    try {
      const res = await toggleLikeComment(commentId);
      if ("error" in res) {
        fetchComments(receivedPage, "received");
        fetchComments(givenPage, "given");
      }
    } catch {
      fetchComments(receivedPage, "received");
      fetchComments(givenPage, "given");
    }
  };

  const handlePin = async (commentId: number) => {
    const updater = (prev: CommentData[]) => prev.map(c =>
      c.id === commentId
        ? { ...c, isPinned: !c.isPinned }
        : c
    );
    setReceived(updater);

    try {
      const res = await togglePinComment(commentId);
      if ("error" in res) {
        fetchComments(receivedPage, "received");
      }
    } catch {
      fetchComments(receivedPage, "received");
    }
  };

  const goToPage = useCallback(async (dir: 1 | -1) => {
    const isReceived = activeTab === "received";
    const currentPage = isReceived ? receivedPage : givenPage;
    const nextPage = currentPage + dir;

    if (nextPage < 1) return;
    if (dir > 0 && (isReceived ? !receivedHasMore : !givenHasMore)) return;

    fetchComments(nextPage, activeTab);
  }, [activeTab, receivedPage, givenPage, receivedHasMore, givenHasMore, fetchComments]);

  const comments = activeTab === "received" ? received : given;
  const page = activeTab === "received" ? receivedPage : givenPage;
  const hasMore = activeTab === "received" ? receivedHasMore : givenHasMore;

  return (
    <div className="h-[500px] bg-[#0f0f0f] border border-white/5 rounded-[20px] p-6 w-full flex flex-col">
      <div className="flex items-start justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-white font-medium text-lg tracking-wide" style={{ fontFamily: "var(--font-comfortaa)" }}>Recent comments</h2>
          <p className="text-white/40 text-[13px] mt-1" style={{ fontFamily: "var(--font-comfortaa)" }}>Comments left on your profile and comments you wrote.</p>
        </div>
        <div className="flex border border-white/5 rounded-full p-1 gap-1">
          {([
            { id: "received" as const, label: `Received ${receivedTotal}` },
            { id: "given" as const, label: `Given ${givenTotal}` },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-normal transition-all relative z-10 cursor-pointer ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="comments-tab-bubble"
                  className="absolute inset-0 bg-[#5b6cf5]/20 shadow-[0_0_15px_rgba(91,108,245,0.1)] rounded-full z-0"
                  transition={{ type: "spring", bounce: 0.35, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={`flex-1 min-h-0 transition-opacity duration-200 ${isLoading ? 'opacity-40 pointer-events-none' : ''} ${comments.length === 0 && !isLoading ? 'bg-white/[0.02] border border-white/5 rounded-[20px]' : ''} overflow-y-auto custom-scrollbar`}>
        {comments.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-6">
             <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20 mb-3">
               <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
             </svg>
            <p className="text-sm font-medium text-white/80">No comments yet</p>
            <p className="text-xs text-white/40 mt-1">{activeTab === "received" ? "Once visitors comment on your profile, you'll see them here." : "You haven't left any comments for other users yet."}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {comments.map(comment => (
              <div key={comment.id} className="group flex items-center gap-3 p-3 rounded-[20px] border border-white/5 bg-[#141414] hover:bg-[#1a1a1a] transition-colors">
                <div className="w-8 h-8 rounded-full bg-white/10 shrink-0 overflow-hidden relative">
                  {comment.author.avatarUrl ? (
                    <Image src={comment.author.avatarUrl} alt={comment.author.username} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[12px] font-medium text-white/50">
                      {comment.author.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white/90 truncate">{comment.author.username}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-white/30">
                        {format(new Date(comment.createdAt), "MM/dd/yyyy, hh:mm a")}
                      </span>

                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => handleLike(comment.id)}
                          className={`flex items-center justify-center transition-colors focus:outline-none gap-1.5 ${comment.isLiked ? 'text-[#ff4b4b]' : 'text-white/40 hover:text-white'}`}
                          title={comment.isLiked ? "Unlike" : "Like"}
                        >
                          <svg width="11" height="11" viewBox="0 0 512 512" fill="currentColor">
                            <path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" />
                          </svg>
                          {comment.likesCount > 0 && <span className="text-[12px] font-medium leading-none">{comment.likesCount}</span>}
                        </button>

                        {activeTab === "received" ? (
                          <button
                            onClick={() => handlePin(comment.id)}
                            className={`flex items-center justify-center transition-colors focus:outline-none ${comment.isPinned ? "text-[#5b6cf5] hover:text-[#4a58c9]" : "text-white/40 hover:text-white"}`}
                            title={comment.isPinned ? "Unpin" : "Pin"}
                          >
                            <svg width="12" height="12" viewBox="0 0 384 512" fill="currentColor" className="-rotate-45 transform origin-center overflow-visible">
                              <path d="M32 32C32 14.3 46.3 0 64 0H320c17.7 0 32 14.3 32 32s-14.3 32-32 32H290.5l11.4 148.2c36.7 19.9 65.7 53.2 79.5 93l.2 1.4c2.2 11.2-1.2 22.8-9 31.1S355.6 352 344 352H208v128c0 17.7-14.3 32-32 32s-32-14.3-32-32V352H40c-11.6 0-22.5-5.3-30.2-14.3s-11.2-19.9-9-31.1l.2-1.4c13.8-39.8 42.8-73.1 79.5-93L93.5 64H64C46.3 64 32 49.7 32 32z" />
                            </svg>
                          </button>
                        ) : comment.isPinned ? (
                          <div className="flex items-center justify-center text-[#5b6cf5]" title="Pinned">
                            <svg width="12" height="12" viewBox="0 0 384 512" fill="currentColor" className="-rotate-45 transform origin-center overflow-visible">
                              <path d="M32 32C32 14.3 46.3 0 64 0H320c17.7 0 32 14.3 32 32s-14.3 32-32 32H290.5l11.4 148.2c36.7 19.9 65.7 53.2 79.5 93l.2 1.4c2.2 11.2-1.2 22.8-9 31.1S355.6 352 344 352H208v128c0 17.7-14.3 32-32 32s-32-14.3-32-32V352H40c-11.6 0-22.5-5.3-30.2-14.3s-11.2-19.9-9-31.1l.2-1.4c13.8-39.8 42.8-73.1 79.5-93L93.5 64H64C46.3 64 32 49.7 32 32z" />
                            </svg>
                          </div>
                        ) : null}

                        <button
                          onClick={() => handleDelete(comment.id, comment.profileId)}
                          className="flex items-center justify-center text-white/40 hover:text-red-500 transition-colors focus:outline-none"
                          title="Delete"
                        >
                          <svg width="11" height="11" viewBox="0 0 448 512" fill="currentColor">
                            <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-[13px] text-white/60 font-light leading-relaxed mt-0.5 truncate">
                    <span className="text-white/40 mr-1">{activeTab === "received" ? "Commented:" : "You commented:"}</span>
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(received.length > 0 || given.length > 0) && (
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-white/5 shrink-0">
          <button
            onClick={() => goToPage(-1)}
            disabled={page <= 1 || isLoading}
            className="w-8 h-8 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] flex items-center justify-center text-white/50 hover:text-white/80 transition-colors disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            {isLoading && <div className="w-3.5 h-3.5 border-2 border-white/10 border-t-[#5b6cf5] rounded-full animate-spin" />}
            <span className="text-[13px] text-white/40 tabular-nums">Page {page}</span>
          </div>
          <button
            onClick={() => goToPage(1)}
            disabled={!hasMore || isLoading}
            className="w-8 h-8 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] flex items-center justify-center text-white/50 hover:text-white/80 transition-colors disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
