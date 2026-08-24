/**
 * The loading state shared by every widget card — the public profile cards and
 * the dashboard customize previews both render this.
 *
 * It lives in one place because there used to be 26 hand-written copies, and
 * they had drifted apart on bar widths and stray platform logos. Change the
 * look here and every widget follows.
 *
 * The grey block mirrors the widget's own image shape, so the skeleton previews
 * the shape the user picked. Widgets with no image-shape setting (Valorant)
 * omit the prop and get the default rounded square.
 */
export default function WidgetSkeleton({ imageShape }: { imageShape?: string }) {
  const shapeClass =
    imageShape === "square"
      ? "rounded-none"
      : imageShape === "circle"
      ? "rounded-full"
      : "rounded-2xl";

  return (
    <div className="w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] shadow-md flex items-center justify-between box-border">
      <div className="flex items-center gap-3.5 min-w-0 w-full">
        <div className={`w-[74px] h-[74px] shrink-0 bg-white/[0.05] ${shapeClass}`} />
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <div className="h-4 w-28 bg-white/[0.06] rounded-md" />
          <div className="h-3 w-20 bg-white/[0.03] rounded-md" />
        </div>
      </div>
    </div>
  );
}
