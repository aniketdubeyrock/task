import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export const KanbanSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {[1, 2, 3].map((col) => (
        <div key={col} className="bg-slate-100/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
            <div className="flex items-center gap-2">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="w-24 h-5" />
            </div>
            <Skeleton className="w-6 h-6 rounded-full" />
          </div>

          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((card) => (
              <div
                key={card}
                className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-crisp flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="w-16 h-5 rounded-md" />
                  <Skeleton className="w-14 h-4 rounded-md" />
                </div>
                <Skeleton className="w-full h-5 rounded-md" />
                <Skeleton className="w-3/4 h-4 rounded-md" />
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <Skeleton className="w-20 h-4 rounded-md" />
                  <Skeleton className="w-7 h-7 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

