import { getSessionUserId } from "@/lib/auth/session";
import { getUserById, getAnalyticsData, getDeviceStats } from "@/lib/features/users/db";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { AnalyticsChart, DeviceChart } from "@/components/charts/LazyCharts";
import RecentComments from "@/components/dashboard/RecentComments";
import RecentFeedback from "@/components/dashboard/RecentFeedback";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { getDashboardComments } from "@/actions/comments";
import { getDashboardFeedback } from "@/actions/feedback";
import { isPremiumActive } from "@/lib/premium";

export const metadata: Metadata = {
  title: "Overview",
  description: "Manage your iuno.lol account and identity",
};

export default async function DashboardPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect('/signin');
  }

  const user = await getUserById(userId);
  const premium = isPremiumActive(user);

  const [rawViews, deviceStats, commentsRes, feedbackRes] = await Promise.all([
    user ? getAnalyticsData(user.id) : Promise.resolve([]),
    user ? getDeviceStats(user.id) : Promise.resolve({ ios: 0, android: 0, windows: 0, mac: 0, other: 0 }),
    getDashboardComments(1, 4),
    getDashboardFeedback(1, 1, 4)
  ]);

  const commentsReceived = commentsRes.success && commentsRes.received ? commentsRes.received : [];
  const commentsGiven = commentsRes.success && commentsRes.given ? commentsRes.given : [];
  
  const feedbackReceived = feedbackRes.success && feedbackRes.received ? feedbackRes.received : [];
  const feedbackGiven = feedbackRes.success && feedbackRes.given ? feedbackRes.given : [];

  return (
    <div className="flex flex-col gap-8" style={{ fontFamily: "var(--font-comfortaa)" }}>
      <div className="border-b border-white/4 pb-5 -mx-12 px-12">
        <Breadcrumb>
          <BreadcrumbList className="text-[13px] gap-2">
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#5b6cf5] font-light tracking-tight" style={{ fontFamily: "var(--font-comfortaa)" }}>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div>
        <h1 className="text-2xl font-light text-white tracking-tight" style={{ fontFamily: "var(--font-comfortaa)" }}>Welcome back, {user?.username || 'User'}</h1>
        <p className="text-white/30 text-sm mt-1">Here is an overview of your statistics.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "USER ID", value: user?.id ? String(user.id) : "—", icon: <span className="font-normal text-lg">#</span>, color: "#5b6cf5" },
          { label: "TOTAL VIEWS", value: user?.views != null ? String(user.views) : "0", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>, color: "#5b6cf5" },
          { label: "USERNAME", value: user?.username || "—", icon: <span className="font-normal text-lg">@</span>, color: "#5b6cf5" },
          { label: "PLAN", value: premium ? "Premium" : "Free", icon: <svg width="18" height="18" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true"><path d="M396.31 32H264l84.19 112.26L396.31 32Zm-280.62 0 48.12 112.26L248 32H115.69ZM256 74.67 192 160h128l-64-85.33Zm166.95-23.61L376.26 160H488L422.95 51.06Zm-333.9 0L23 160h112.74L89.05 51.06ZM146.68 192H24l222.8 288h.53L146.68 192Zm218.64 0L264.67 480h.53L488 192H365.32Zm-35.93 0H182.61L256 400l73.39-208Z" /></svg>, color: "#5b6cf5" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white/2 border border-white/4 rounded-[20px] p-4 flex items-center gap-4 hover:border-white/8 transition-colors"
          >
            <div
              className="w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div className="flex flex-col gap-1 overflow-hidden">
              <span className="text-[11px] uppercase tracking-wider text-white/50 font-normal">
                {stat.label}
              </span>
              <span className="text-white text-base font-normal leading-none truncate">
                {stat.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2 min-w-0 min-h-0">
          <AnalyticsChart totalViews={user?.views || 0} initialData={rawViews} />
      </div>

        <div className="md:col-span-1 min-w-0 min-h-0">
          <DeviceChart stats={deviceStats} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <RecentComments
          initialReceived={commentsReceived}
          initialGiven={commentsGiven}
          initialReceivedHasMore={!!(commentsRes.success && commentsRes.receivedHasMore)}
          initialGivenHasMore={!!(commentsRes.success && commentsRes.givenHasMore)}
          initialReceivedTotal={commentsRes.success ? commentsRes.receivedTotal ?? 0 : 0}
          initialGivenTotal={commentsRes.success ? commentsRes.givenTotal ?? 0 : 0}
        />
        <RecentFeedback
          initialReceived={feedbackReceived}
          initialGiven={feedbackGiven}
          initialReceivedHasMore={!!(feedbackRes.success && feedbackRes.receivedHasMore)}
          initialGivenHasMore={!!(feedbackRes.success && feedbackRes.givenHasMore)}
          initialReceivedTotal={feedbackRes.success ? feedbackRes.receivedTotal ?? 0 : 0}
          initialGivenTotal={feedbackRes.success ? feedbackRes.givenTotal ?? 0 : 0}
        />
      </div>
    </div>
  );
}
