import { Skeleton } from '../ui/Skeleton';
import { motion } from 'framer-motion';

export function DashboardSkeleton() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 animate-in fade-in duration-700"
    >
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-5 w-80 rounded-lg" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-40 rounded-xl" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
      </div>

      {/* Getting Started Skeleton */}
      <div className="bg-white p-12 rounded-[32px] border border-[#EBEBEB] shadow-premium space-y-8">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40 rounded-lg" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-10 rounded-[32px] border border-[#EBEBEB] shadow-soft space-y-8">
            <div className="flex items-center justify-between">
              <Skeleton className="w-12 h-12 rounded-2xl" />
              <Skeleton className="h-4 w-20 rounded-full" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-32 rounded-lg" />
              <Skeleton className="h-10 w-48 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-[32px] border border-[#EBEBEB] shadow-premium overflow-hidden">
            <div className="px-10 py-8 border-b border-[#F5F5F7]">
              <Skeleton className="h-6 w-40 rounded-lg" />
            </div>
            <div className="p-10 space-y-6">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex items-center justify-between py-4 border-b border-[#F5F5F7] last:border-0">
                  <div className="flex items-center gap-5">
                    <Skeleton className="w-12 h-12 rounded-2xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32 rounded-lg" />
                      <Skeleton className="h-3 w-20 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-24 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
