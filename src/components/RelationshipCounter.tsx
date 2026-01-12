'use client';

import { Heart } from 'lucide-react';
import { getDaysTogether } from '@/lib/utils';

interface RelationshipCounterProps {
  anniversaryDate: string;
  partner1Name?: string;
  partner2Name?: string;
}

export function RelationshipCounter({ 
  anniversaryDate, 
  partner1Name, 
  partner2Name 
}: RelationshipCounterProps) {
  const days = getDaysTogether(anniversaryDate);
  
  const names = [partner1Name, partner2Name].filter(Boolean);
  const displayNames = names.length === 2 
    ? `${names[0]} & ${names[1]}` 
    : names[0] || 'Us';

  return (
    <div className="bg-gradient-to-r from-rose-400 to-rose-500 rounded-2xl p-4 text-white shadow-lg shadow-rose-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-rose-100 text-sm font-medium">{displayNames}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold">{days.toLocaleString()}</span>
            <span className="text-rose-100 text-sm">days together</span>
          </div>
        </div>
        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Heart className="w-7 h-7 text-white fill-white" />
        </div>
      </div>
    </div>
  );
}
