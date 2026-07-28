"use client";

import { useState, useEffect } from "react";
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

export default function RecentFeedback() {
  const [activeTab, setActiveTab] = useState<"received" | "given">("received");
  const [received, setReceived] = useState<FeedbackData[]>([]);
  const [given, setGiven] = useState<FeedbackData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeedback = async () => {
    setIsLoading(true);
    try {
      const res = await getDashboardFeedback();
      if (res.success) {
        setReceived(res.received as unknown as FeedbackData[]);
        setGiven(res.given as unknown as FeedbackData[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const data = activeTab === "received" ? received : given;

  return (
    <div className="bg-[#0f0f0f] border border-white/5 rounded-[20px] p-6 w-full h-full relative flex flex-col min-h-[300px]">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-white font-inter font-medium text-lg tracking-wide">Recent feedback</h2>
          <p className="text-white/30 text-xs mt-1 font-inter">Likes and dislikes you received and gave.</p>
        </div>
        
        <div className="flex border border-white/5 rounded-full p-1 gap-1">
          <button
            onClick={() => setActiveTab("received")}
            className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${activeTab === "received" ? "bg-[#609fda]/10 text-[#609fda]" : "text-white/40 hover:text-white/60 hover:bg-white/5"}`}
          >
            Received {received.length}
          </button>
          <button
            onClick={() => setActiveTab("given")}
            className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${activeTab === "given" ? "bg-[#609fda]/10 text-[#609fda]" : "text-white/40 hover:text-white/60 hover:bg-white/5"}`}
          >
            Given {given.length}
          </button>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto mt-2 min-h-0 ${isLoading || data.length === 0 ? 'bg-white/[0.02] border border-white/5 rounded-[20px]' : ''} custom-scrollbar`}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <div className="w-5 h-5 border-2 border-white/10 border-t-[#609fda] rounded-full animate-spin" />
          </div>
        ) : data.length === 0 ? (
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
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-white/5 flex items-center justify-center mt-1">
                    {otherUser?.avatarUrl ? (
                      <Image src={otherUser.avatarUrl} alt={otherUser.username || "User"} width={32} height={32} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-white/40 uppercase font-medium">{otherUser?.username?.[0] || "?"}</span>
                    )}
                  </div>
                  
                  {/* Content */}
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
    </div>
  );
}
