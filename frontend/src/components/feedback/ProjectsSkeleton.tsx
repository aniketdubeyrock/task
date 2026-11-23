import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export const ProjectsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <div
          key={idx}
          className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-crisp flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <Skeleton className="w-16 h-6 rounded-full" />
          </div>
          <div>
            <Skeleton className="w-3/4 h-6 mb-2" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-2/3 h-4 mt-1" />
          </div>
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex justify-between">
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-10 h-4" />
            </div>
            <Skeleton className="w-full h-2 rounded-full" />
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-20 h-4" />
          </div>
        </div>
      ))}
    </div>
  );
};

