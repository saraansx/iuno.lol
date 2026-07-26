import { Skeleton } from "@/components/ui/skeleton";

export default function PageSkeleton() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl p-2 animate-in fade-in duration-500">
      
      {/* Title Area */}
      <div className="flex flex-col gap-3">
        <Skeleton className="w-32 h-6 rounded-md" />
        <Skeleton className="w-64 h-3 rounded-md" />
      </div>

      {/* Minimal Content Lines */}
      <div className="flex flex-col gap-4 mt-2">
        <Skeleton className="w-full h-3 rounded-md opacity-100" />
        <Skeleton className="w-11/12 h-3 rounded-md opacity-80" />
        <Skeleton className="w-4/5 h-3 rounded-md opacity-60" />
        <Skeleton className="w-2/5 h-3 rounded-md opacity-40" />
      </div>
      
    </div>
  );
}
