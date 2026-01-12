'use client';

import { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import { Download, Image as ImageIcon, ChevronLeft, ChevronRight, Loader2, Heart } from 'lucide-react';
import { useRealtimeDates } from '@/lib/hooks/useRealtimeDates';
import { categoryConfig } from '@/lib/utils';
import type { DateEntry } from '@/types/database';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';

interface CollageClientProps {
  initialDates: DateEntry[];
  coupleInfo: {
    coupleId: string;
    displayName?: string;
    partner1Name?: string;
    partner2Name?: string;
  };
}

export function CollageClient({ initialDates, coupleInfo }: CollageClientProps) {
  const collageRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  
  const { completedDates } = useRealtimeDates(coupleInfo.coupleId, initialDates);

  // Get unique months from dates
  const months = useMemo(() => {
    const monthSet = new Set<string>();
    completedDates.forEach((date) => {
      const d = new Date(date.date_timestamp);
      monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    });
    const sorted = Array.from(monthSet).sort().reverse();
    // Set initial selected month to the most recent
    if (sorted.length > 0 && !selectedMonth) {
      setSelectedMonth(sorted[0]);
    }
    return sorted;
  }, [completedDates, selectedMonth]);

  // Filter dates by selected month
  const monthDates = useMemo(() => {
    if (!selectedMonth) return [];
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

  const navigateMonth = (direction: 'prev' | 'next') => {
    const currentIndex = months.indexOf(selectedMonth);
    if (direction === 'prev' && currentIndex < months.length - 1) {
      setSelectedMonth(months[currentIndex + 1]);
    } else if (direction === 'next' && currentIndex > 0) {
      setSelectedMonth(months[currentIndex - 1]);
    }
  };

  const handleDownload = async () => {
    if (!collageRef.current) return;
    
    setDownloading(true);
    try {
      const dataUrl = await toPng(collageRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#FFFBEB',
      });
      
      const link = document.createElement('a');
      link.download = `us-${selectedMonth}-collage.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to generate collage:', error);
    } finally {
      setDownloading(false);
    }
  };

  const names = [coupleInfo.partner1Name, coupleInfo.partner2Name].filter(Boolean);
  const displayNames = names.length === 2 ? `${names[0]} & ${names[1]}` : 'Us';

  // Determine grid layout based on number of dates
  const getGridClass = (count: number) => {
    if (count <= 1) return 'grid-cols-1';
    if (count <= 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    return 'grid-cols-3';
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Collage</h1>
          <p className="text-gray-500 text-sm mt-0.5">Monthly memories</p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-rose-500 rounded-full flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Month Navigation */}
      {months.length > 0 && (
        <div className="flex items-center justify-between mb-6 bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
          <button
            onClick={() => navigateMonth('prev')}
            disabled={months.indexOf(selectedMonth) >= months.length - 1}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-800">
            {selectedMonth ? formatMonthLabel(selectedMonth) : 'Select Month'}
          </span>
          <button
            onClick={() => navigateMonth('next')}
            disabled={months.indexOf(selectedMonth) <= 0}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}

      {/* Collage Preview */}
      {monthDates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 text-center border border-gray-100"
        >
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-rose-400" />
          </div>
          <h3 className="font-medium text-gray-800 mb-1">No memories this month</h3>
          <p className="text-sm text-gray-500">
            Complete some dates to create a collage!
          </p>
        </motion.div>
      ) : (
        <>
          {/* Collage */}
          <div 
            ref={collageRef}
            className="bg-[#FFFBEB] rounded-2xl overflow-hidden shadow-lg"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-400 to-rose-500 px-6 py-5 text-center">
              <h2 className="font-handwritten text-3xl text-white mb-1">
                {selectedMonth ? formatMonthLabel(selectedMonth) : 'Our Moments'}
              </h2>
              <p className="text-rose-100 text-sm flex items-center justify-center gap-2">
                <Heart className="w-4 h-4 fill-current" />
                {displayNames}
                <Heart className="w-4 h-4 fill-current" />
              </p>
            </div>

            {/* Photos Grid */}
            <div className={`grid ${getGridClass(monthDates.length)} gap-3 p-4`}>
              {monthDates.slice(0, 9).map((date, index) => {
                const config = categoryConfig[date.category];
                return (
                  <motion.div
                    key={date.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    {/* Polaroid Frame */}
                    <div className="bg-white p-2 pb-10 shadow-md rounded-sm transform hover:-rotate-1 transition-transform">
                      <div className="aspect-square bg-gray-100 relative overflow-hidden">
                        {date.photo_url ? (
                          <Image
                            src={date.photo_url}
                            alt={date.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${config.bgColor}`}>
                            <span className="text-4xl">{config.emoji}</span>
                          </div>
                        )}
                      </div>
                      {/* Caption */}
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="font-handwritten text-sm text-gray-700 text-center truncate">
                          {date.title}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-4 pb-4 text-center">
              <p className="text-gray-400 text-xs">
                {monthDates.length} date{monthDates.length !== 1 ? 's' : ''} • Made with Us 💕
              </p>
            </div>
          </div>

          {/* Download Button */}
          <div className="mt-6">
            <Button
              onClick={handleDownload}
              variant="primary"
              size="lg"
              loading={downloading}
              icon={downloading ? undefined : <Download className="w-5 h-5" />}
              className="w-full"
            >
              {downloading ? 'Generating...' : 'Save Collage'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
