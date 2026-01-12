'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadPhoto } from '@/lib/actions/storage';
import Image from 'next/image';

interface PhotoUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  className?: string;
}

// Compress image on client side before upload
async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export function PhotoUpload({ value, onChange, className }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress('Compressing...');

    try {
      // Compress image before uploading
      const compressedFile = await compressImage(file);
      
      setUploadProgress('Uploading...');
      
      const formData = new FormData();
      formData.append('file', compressedFile);

      const result = await uploadPhoto(formData);

      if (result.url) {
        onChange(result.url);
      } else {
        setError(result.error || 'Failed to upload');
      }
    } catch {
      setError('Failed to process image');
    }

    setUploading(false);
    setUploadProgress('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('relative', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        id="photo-upload"
      />

      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100"
          >
            <Image
              src={value}
              alt="Uploaded photo"
              fill
              className="object-cover"
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </motion.div>
        ) : (
          <motion.label
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            htmlFor="photo-upload"
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={cn(
              'flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed cursor-pointer transition-all',
              dragActive
                ? 'border-rose-400 bg-rose-50'
                : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100',
              uploading && 'pointer-events-none'
            )}
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
                {uploadProgress && (
                  <span className="text-xs text-gray-500 mt-2">{uploadProgress}</span>
                )}
              </div>
            ) : (
              <>
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                  {dragActive ? (
                    <ImageIcon className="w-6 h-6 text-rose-400" />
                  ) : (
                    <Camera className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {dragActive ? 'Drop photo here' : 'Add a photo'}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  Tap to upload or drag & drop
                </span>
              </>
            )}
          </motion.label>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-sm text-red-500 mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
