'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Calendar, Heart, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRealtimeDates } from '@/lib/hooks/useRealtimeDates';
import { formatDate, categoryConfig } from '@/lib/utils';
import type { DateEntry } from '@/types/database';
import Image from 'next/image';

interface MemoriesClientProps {
  initialDates: DateEntry[];
  coupleId: string;
}

export function MemoriesClient({ initialDates, coupleId }: MemoriesClientProps) {
  const [selectedDate, setSelectedDate] = useState<DateEntry | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  
  const { completedDates } = useRealtimeDates(coupleId, initialDates);

  // Get unique months from dates
  const months = useMemo(() => {
    const monthSet = new Set<string>();
    completedDates.forEach((date) => {
      const d = new Date(date.date_timestamp);
      monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    });
    return Array.from(monthSet).sort().reverse();
  }, [completedDates]);

  // Filter dates by selected month
  const filteredDates = useMemo(() => {
    if (selectedMonth === 'all') return completedDates;
    return completedDates.filter((date) => {
      const d = new Date(date.date_timestamp);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === selectedMonth;
    });
  }, [completedDates, selectedMonth]);

  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Memories</h1>
          <p className="text-gray-500 text-sm mt-0.5">Our special moments</p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-rose-500 rounded-full flex items-center justify-center">
          <Camera className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Month Filter */}
      {months.length > 0 && (
        <div className="mb-6 overflow-x-auto pb-2 -mx-4 px-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedMonth('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedMonth === 'all'
                  ? 'bg-rose-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              All Time
            </button>
            {months.map((month) => (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedMonth === month
                    ? 'bg-rose-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {formatMonthLabel(month)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Memory Grid */}
      <AnimatePresence mode="popLayout">
        {filteredDates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 text-center border border-gray-100"
          >
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-rose-400" />
            </div>
            <h3 className="font-medium text-gray-800 mb-1">No memories yet</h3>
            <p className="text-sm text-gray-500">
              Complete a date to capture your first memory!
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredDates.map((date, index) => {
              const config = categoryConfig[date.category];
              return (
                <motion.div
                  key={date.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedDate(date)}
                  className="cursor-pointer group"
                >
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 relative">
                    {date.photo_url ? (
                      <Image
                        src={date.photo_url}
                        alt={date.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${config.bgColor}`}>
                        <span className="text-5xl">{config.emoji}</span>
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {/* Title */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white font-medium text-sm truncate">{date.title}</p>
                      <p className="text-white/70 text-xs">{formatDate(date.date_timestamp)}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Memory Detail Modal */}
      <AnimatePresence>
        {selectedDate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDate(null)}
              className="fixed inset-0 bg-black/80 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] md:max-h-[80vh] bg-white rounded-3xl overflow-hidden z-50 flex flex-col"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedDate(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Photo */}
              <div className="relative aspect-square bg-gray-100">
                {selectedDate.photo_url ? (
                  <Image
                    src={selectedDate.photo_url}
                    alt={selectedDate.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${categoryConfig[selectedDate.category].bgColor}`}>
                    <span className="text-8xl">{categoryConfig[selectedDate.category].emoji}</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-5 flex-1 overflow-y-auto">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{selectedDate.title}</h2>
                    <div className="flex items-center gap-2 mt-1.5 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{formatDate(selectedDate.date_timestamp)}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryConfig[selectedDate.category].color}`}>
                    {selectedDate.category}
                  </span>
                </div>

                {selectedDate.notes && (
                  <div className="bg-rose-50 rounded-xl p-4">
                    <p className="text-sm text-gray-700 italic">&ldquo;{selectedDate.notes}&rdquo;</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
