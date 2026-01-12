'use client';

import { useState, useTransition } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PhotoUpload } from '@/components/PhotoUpload';
import { completeWithPhoto } from '@/lib/actions/dates';
import type { DateEntry } from '@/types/database';
import { categoryConfig } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface CompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: DateEntry | null;
}

export function CompleteModal({ isOpen, onClose, date }: CompleteModalProps) {
  const [isPending, startTransition] = useTransition();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleClose = () => {
    setPhotoUrl(null);
    setNotes('');
    setError('');
    onClose();
  };

  const handleComplete = () => {
    if (!date) return;

    startTransition(async () => {
      const result = await completeWithPhoto(
        date.id,
        photoUrl || '',
        notes.trim() || undefined
      );

      if (result.success) {
        handleClose();
      } else {
        setError(result.error || 'Something went wrong');
      }
    });
  };

  if (!date) return null;

  const config = categoryConfig[date.category];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Complete Date"
    >
      <div className="space-y-5">
        {/* Date Info */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${config.color}`}>
            {config.emoji}
          </div>
          <div>
            <h3 className="font-medium text-gray-800">{date.title}</h3>
            <p className="text-sm text-gray-500">{date.category}</p>
          </div>
        </div>

        {/* Celebration Message */}
        <div className="flex items-center gap-2 text-rose-500">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-medium">How was your date?</span>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add a memory photo
          </label>
          <PhotoUpload
            value={photoUrl}
            onChange={setPhotoUrl}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Favorite moment (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What made this date special?"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all resize-none"
          />
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
            onClick={handleComplete}
            variant="primary"
            loading={isPending}
            className="flex-1"
          >
            Complete Date 💕
          </Button>
        </div>
      </div>
    </Modal>
  );
}
