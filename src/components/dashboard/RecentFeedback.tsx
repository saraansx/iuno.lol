"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { getDashboardFeedback } from "@/actions/feedback";

type FeedbackData = {
  id: number;
  receiverId: number;
  giverId: number;
  type: string;
  createdAt: string | Date;
  giver?: {
    id: number;
    username: string;
    avatarUrl: string | null;
  };
  receiver?: {
    id: number;
    username: string;
    avatarUrl: string | null;
  };
};

interface RecentFeedbackProps {
  initialReceived: FeedbackData[];
  initialGiven: FeedbackData[];
  initialReceivedHasMore?: boolean;
  initialGivenHasMore?: boolean;
  initialReceivedTotal?: number;
  initialGivenTotal?: number;
}

const PAGE_SIZE = 4;

export default function RecentFeedback({
  initialReceived,
  initialGiven,
  initialReceivedHasMore = false,
  initialGivenHasMore = false,
  initialReceivedTotal = 0,
  initialGivenTotal = 0,
}: RecentFeedbackProps) {
  const [activeTab, setActiveTab] = useState<"received" | "given">("received");
  const [received, setReceived] = useState<FeedbackData[]>(initialReceived);
  const [given, setGiven] = useState<FeedbackData[]>(initialGiven);
  const [receivedHasMore, setReceivedHasMore] = useState(initialReceivedHasMore);
  const [givenHasMore, setGivenHasMore] = useState(initialGivenHasMore);
  const [receivedTotal, setReceivedTotal] = useState(initialReceivedTotal);
  const [givenTotal, setGivenTotal] = useState(initialGivenTotal);
  const [receivedPage, setReceivedPage] = useState(1);
  const [givenPage, setGivenPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const goToPage = useCallback(async (dir: 1 | -1) => {
    const isReceived = activeTab === "received";
    const currentPage = isReceived ? receivedPage : givenPage;
    const nextPage = currentPage + dir;

    if (nextPage < 1) return;
    if (dir > 0 && (isReceived ? !receivedHasMore : !givenHasMore)) return;

    setIsLoading(true);
    try {
      const res = await getDashboardFeedback(
        isReceived ? nextPage : receivedPage,
        isReceived ? givenPage : nextPage,
        PAGE_SIZE,
      );
      if (res.success) {
        if (isReceived) {
          setReceived(res.received ?? []);
          setReceivedHasMore(!!res.receivedHasMore);
          setReceivedPage(nextPage);
          setReceivedTotal(res.receivedTotal ?? 0);
        } else {
          setGiven(res.given ?? []);
          setGivenHasMore(!!res.givenHasMore);
          setGivenPage(nextPage);
          setGivenTotal(res.givenTotal ?? 0);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, receivedPage, givenPage, receivedHasMore, givenHasMore]);

  const data = activeTab === "received" ? received : given;
  const page = activeTab === "received" ? receivedPage : givenPage;
  const hasMore = activeTab === "received" ? receivedHasMore : givenHasMore;

  return (
    <div className="h-[500px] bg-[#0f0f0f] border border-white/5 rounded-[20px] p-6 w-full relative flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-white font-medium text-lg tracking-wide" style={{ fontFamily: "var(--font-comfortaa)" }}>Recent feedback</h2>
          <p className="text-white/30 text-xs mt-1" style={{ fontFamily: "var(--font-comfortaa)" }}>Likes and dislikes you received and gave.</p>
        </div>

        <div className="flex border border-white/5 rounded-full p-1 gap-1">
          <button
            onClick={() => setActiveTab("received")}
            className={`px-4 py-1.5 rounded-full text-[13px] font-normal transition-all cursor-pointer ${activeTab === "received" ? "bg-[#609fda]/20 hover:bg-[#609fda]/30 text-white shadow-[0_0_15px_rgba(96,159,218,0.1)]" : "text-white/40 hover:text-white/60 hover:bg-white/5"}`}
          >
            Received {receivedTotal}
          </button>
          <button
            onClick={() => setActiveTab("given")}
            className={`px-4 py-1.5 rounded-full text-[13px] font-normal transition-all cursor-pointer ${activeTab === "given" ? "bg-[#609fda]/20 hover:bg-[#609fda]/30 text-white shadow-[0_0_15px_rgba(96,159,218,0.1)]" : "text-white/40 hover:text-white/60 hover:bg-white/5"}`}
          >
            Given {givenTotal}
          </button>
        </div>
      </div>

      <div className={`flex-1 min-h-0 transition-opacity duration-200 ${isLoading ? 'opacity-40 pointer-events-none' : ''} ${data.length === 0 && !isLoading ? 'bg-white/[0.02] border border-white/5 rounded-[20px]' : ''} overflow-y-auto custom-scrollbar`}>
        {data.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-6">
             <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-white/20 mb-3">
               <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
             </svg>
            <p className="text-sm font-medium text-white/80">No feedback yet</p>
            <p className="text-xs text-white/40 mt-1">{activeTab === "received" ? "Once visitors react to your profile, you'll see them here." : "You haven't left any feedback for other users yet."}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {data.map((item) => {
              const otherUser = activeTab === "received" ? item.giver : item.receiver;
              return (
                <div key={item.id} className="p-3 flex items-center gap-3 transition-colors bg-[#141414] hover:bg-[#1a1a1a] border border-white/5 rounded-[20px]">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-white/5 flex items-center justify-center mt-1">
                    {otherUser?.avatarUrl ? (
                      <Image src={otherUser.avatarUrl} alt={otherUser.username || "User"} width={32} height={32} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-white/40 uppercase font-medium">{otherUser?.username?.[0] || "?"}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-white/90 truncate">{otherUser?.username || "Unknown user"}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-white/30 tracking-wide">{format(new Date(item.createdAt), "MM/dd/yyyy, hh:mm a")}</span>
                        {item.type === 'like' ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[#609fda]">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#ff4b4b]">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <p className="text-white/40 text-[13px] mt-0.5 font-thin">{activeTab === "received" ? (item.type === 'like' ? 'Liked your profile' : 'Disliked your profile') : (item.type === 'like' ? 'You liked their profile' : 'You disliked their profile')}</p>
                  </div>
                </div>
              );
            })}
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
            {isLoading && <div className="w-3.5 h-3.5 border-2 border-white/10 border-t-[#609fda] rounded-full animate-spin" />}
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
