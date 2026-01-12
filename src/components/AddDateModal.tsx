'use client';

import { useState, useTransition } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn, categoryConfig } from '@/lib/utils';
import { createDate, updateDate } from '@/lib/actions/dates';
import type { DateEntry, DateCategory } from '@/types/database';
import { CalendarDays, Clock } from 'lucide-react';

interface AddDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingDate?: DateEntry | null;
}

const categories: DateCategory[] = ['Chai', 'Restaurant', 'Home', 'Walk', 'Surprise'];

export function AddDateModal({ isOpen, onClose, editingDate }: AddDateModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  
  const isEditing = !!editingDate;

  // Form state
  const [title, setTitle] = useState(editingDate?.title || '');
  const [category, setCategory] = useState<DateCategory>(editingDate?.category || 'Chai');
  const [dateValue, setDateValue] = useState(
    editingDate?.date_timestamp 
      ? new Date(editingDate.date_timestamp).toISOString().split('T')[0]
      : ''
  );
  const [timeValue, setTimeValue] = useState(
    editingDate?.date_timestamp
      ? new Date(editingDate.date_timestamp).toTimeString().slice(0, 5)
      : '18:00'
  );

  const resetForm = () => {
    setTitle('');
    setCategory('Chai');
    setDateValue('');
    setTimeValue('18:00');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !dateValue) {
      setError('Please fill in all required fields');
      return;
    }

    setError('');
    
    startTransition(async () => {
      const dateTimestamp = new Date(`${dateValue}T${timeValue}`).toISOString();

      const result = isEditing && editingDate
        ? await updateDate({
            id: editingDate.id,
            title: title.trim(),
            category,
            date_timestamp: dateTimestamp,
          })
        : await createDate({
            title: title.trim(),
            category,
            date_timestamp: dateTimestamp,
          });

      if (result.success) {
        handleClose();
      } else {
        setError(result.error || 'Something went wrong');
      }
    });
  };

  // Update form when editingDate changes
  if (editingDate && title !== editingDate.title) {
    setTitle(editingDate.title);
    setCategory(editingDate.category);
    setDateValue(new Date(editingDate.date_timestamp).toISOString().split('T')[0]);
    setTimeValue(new Date(editingDate.date_timestamp).toTimeString().slice(0, 5));
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title={isEditing ? 'Edit Date' : 'Plan a Date'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <Input
          label="What's the plan?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Coffee at our favorite spot"
          autoFocus
        />

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Type of date
          </label>
          <div className="grid grid-cols-5 gap-2">
            {categories.map((cat) => {
              const config = categoryConfig[cat];
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'flex flex-col items-center p-3 rounded-xl border-2 transition-all',
                    isSelected
                      ? 'border-rose-400 bg-rose-50'
                      : 'border-gray-100 hover:border-gray-200'
                  )}
                >
                  <span className="text-2xl mb-1">{config.emoji}</span>
                  <span className={cn(
                    'text-xs font-medium',
                    isSelected ? 'text-rose-600' : 'text-gray-500'
                  )}>
                    {cat}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarDays className="w-4 h-4 inline mr-1" />
              Date
            </label>
            <input
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Time
            </label>
            <input
              type="time"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isPending}
            className="flex-1"
          >
            {isEditing ? 'Save Changes' : 'Add Date'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
