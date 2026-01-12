'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, Sparkles } from 'lucide-react';
import { DateCard } from '@/components/DateCard';
import { RelationshipCounter } from '@/components/RelationshipCounter';
import { AddDateModal } from '@/components/AddDateModal';
import { CompleteModal } from '@/components/CompleteModal';
import { useRealtimeDates } from '@/lib/hooks/useRealtimeDates';
import { deleteDate } from '@/lib/actions/dates';
import type { DateEntry } from '@/types/database';

interface DashboardClientProps {
  initialDates: DateEntry[];
  coupleInfo: {
    coupleId: string;
    displayName?: string;
    anniversaryDate?: string;
    partner1Name?: string;
    partner2Name?: string;
  };
}

export function DashboardClient({ initialDates, coupleInfo }: DashboardClientProps) {
  const [isPending, startTransition] = useTransition();
  const [editingDate, setEditingDate] = useState<DateEntry | null>(null);
  const [completingDate, setCompletingDate] = useState<DateEntry | null>(null);
  
  const { upcomingDates, completedDates, dates } = useRealtimeDates(
    coupleInfo.coupleId, 
    initialDates
  );

  const handleComplete = (id: string) => {
    const date = dates.find(d => d.id === id);
    if (date) {
      setCompletingDate(date);
    }
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      await deleteDate(id);
    });
  };

  const handleEdit = (date: DateEntry) => {
    setEditingDate(date);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Our Dates</h1>
          <p className="text-gray-500 text-sm mt-0.5">Plan something special</p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-rose-500 rounded-full flex items-center justify-center">
          <Heart className="w-5 h-5 text-white fill-white" />
        </div>
      </div>

      {/* Relationship Counter */}
      {coupleInfo.anniversaryDate && (
        <div className="mb-6">
          <RelationshipCounter
            anniversaryDate={coupleInfo.anniversaryDate}
            partner1Name={coupleInfo.partner1Name}
            partner2Name={coupleInfo.partner2Name}
          />
        </div>
      )}

      {/* Upcoming Dates */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-rose-500" />
          <h2 className="font-semibold text-gray-800">Upcoming</h2>
          <span className="bg-rose-100 text-rose-600 text-xs font-medium px-2 py-0.5 rounded-full">
            {upcomingDates.length}
          </span>
        </div>

        <AnimatePresence mode="popLayout">
          {upcomingDates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 text-center border border-gray-100"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-rose-400" />
              </div>
              <h3 className="font-medium text-gray-800 mb-1">No dates planned</h3>
              <p className="text-sm text-gray-500">
                Tap the + button to plan your next date!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {upcomingDates.map((date, index) => (
                <motion.div
                  key={date.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <DateCard
                    date={date}
                    onComplete={handleComplete}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* Recent Completed */}
      {completedDates.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-green-500" />
            <h2 className="font-semibold text-gray-800">Recent Memories</h2>
          </div>

          <div className="space-y-3">
            {completedDates.slice(0, 3).map((date, index) => (
              <motion.div
                key={date.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <DateCard
                  date={date}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Edit Modal */}
      <AddDateModal
        isOpen={!!editingDate}
        onClose={() => setEditingDate(null)}
        editingDate={editingDate}
      />

      {/* Complete Modal */}
      <CompleteModal
        isOpen={!!completingDate}
        onClose={() => setCompletingDate(null)}
        date={completingDate}
      />
    </div>
  );
}
