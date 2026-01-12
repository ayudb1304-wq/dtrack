'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Check, Clock, Trash2, Edit2 } from 'lucide-react';
import { cn, formatDateTime, getRelativeTime, categoryConfig } from '@/lib/utils';
import type { DateEntry } from '@/types/database';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface DateCardProps {
  date: DateEntry;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (date: DateEntry) => void;
}

export function DateCard({ date, onComplete, onDelete, onEdit }: DateCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-100, 0, 100],
    date.is_completed ? ['#EF4444', '#FFFFFF', '#FFFFFF'] : ['#EF4444', '#FFFFFF', '#22C55E']
  );
  const deleteOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);
  const completeOpacity = useTransform(x, [0, 50, 100], [0, 0.5, 1]);

  const config = categoryConfig[date.category];
  const relativeTime = getRelativeTime(date.date_timestamp);
  const isToday = relativeTime === 'Today';
  const isTomorrow = relativeTime === 'Tomorrow';

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80 && onDelete) {
      // Show confirmation dialog instead of deleting immediately
      setShowDeleteConfirm(true);
    } else if (info.offset.x > 80 && onComplete && !date.is_completed) {
      onComplete(date.id);
    }
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      setIsDeleting(true);
      setTimeout(() => onDelete(date.id), 200);
    }
  };

  if (isDeleting) {
    return (
      <motion.div
        initial={{ height: 'auto', opacity: 1 }}
        animate={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      />
    );
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl">
        {/* Background actions */}
        <div className="absolute inset-0 flex items-center justify-between px-6">
          <motion.div style={{ opacity: deleteOpacity }} className="flex items-center gap-2 text-white">
            <Trash2 className="w-5 h-5" />
            <span className="text-sm font-medium">Delete</span>
          </motion.div>
          {!date.is_completed && (
            <motion.div style={{ opacity: completeOpacity }} className="flex items-center gap-2 text-white">
              <span className="text-sm font-medium">Complete</span>
              <Check className="w-5 h-5" />
            </motion.div>
          )}
        </div>

        {/* Card */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          dragDirectionLock
          onDrag={(_, info) => {
            // Prevent right swipe for completed dates
            if (date.is_completed && info.offset.x > 0) {
              x.set(0);
            }
          }}
          onDragEnd={handleDragEnd}
          style={{ x, backgroundColor: background }}
          className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-4 cursor-grab active:cursor-grabbing"
        >
        <div className="flex items-start gap-4">
          {/* Category Badge */}
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-2xl', config.color)}>
            {config.emoji}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-800 truncate">{date.title}</h3>
              <button
                onClick={() => onEdit?.(date)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
              >
                <Edit2 className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 mt-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">{formatDateTime(date.date_timestamp)}</span>
            </div>

            {/* Status Badge */}
            <div className="mt-3 flex items-center gap-2">
              {date.is_completed ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <Check className="w-3 h-3" />
                  Completed
                </span>
              ) : (
                <span className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium',
                  isToday ? 'bg-rose-100 text-rose-600' :
                  isTomorrow ? 'bg-amber-100 text-amber-600' :
                  'bg-gray-100 text-gray-600'
                )}>
                  {relativeTime}
                </span>
              )}
              <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', config.color)}>
                {date.category}
              </span>
            </div>
          </div>
        </div>

          {/* Swipe hint */}
          <div className="text-center text-xs text-gray-300 mt-3">
            {date.is_completed ? (
              '← swipe to delete'
            ) : (
              '← swipe to delete • swipe to complete →'
            )}
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog - Outside overflow container */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Date"
        message={`Are you sure you want to delete "${date.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Keep it"
        variant="danger"
      />
    </>
  );
}
