'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Loader2, Heart, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadCouplePhoto, deleteCouplePhoto } from '@/lib/actions/storage';
import Image from 'next/image';

interface CoupleProfilePhotoProps {
  photoUrl?: string | null;
  partner1Name?: string;
  partner2Name?: string;
  onPhotoChange?: (url: string | null) => void;
  className?: string;
}

// Compress image on client side before upload
async function compressImage(file: File, maxWidth = 800, quality = 0.85): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
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

export function CoupleProfilePhoto({ 
  photoUrl, 
  partner1Name, 
  partner2Name, 
  onPhotoChange,
  className 
}: CoupleProfilePhotoProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [currentPhoto, setCurrentPhoto] = useState(photoUrl);
  const [showOptions, setShowOptions] = useState(false);
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
    setShowOptions(false);

    try {
      const compressedFile = await compressImage(file);
      
      const formData = new FormData();
      formData.append('file', compressedFile);

      const result = await uploadCouplePhoto(formData);

      if (result.url) {
        setCurrentPhoto(result.url);
        onPhotoChange?.(result.url);
      } else {
        setError(result.error || 'Failed to upload');
      }
    } catch {
      setError('Failed to process image');
    }

    setUploading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = async () => {
    setUploading(true);
    setShowOptions(false);
    
    const result = await deleteCouplePhoto();
    
    if (result.success) {
      setCurrentPhoto(null);
      onPhotoChange?.(null);
    } else {
      setError(result.error || 'Failed to remove photo');
    }
    
    setUploading(false);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  // Generate initials fallback
  const getInitials = () => {
    const p1 = partner1Name?.charAt(0)?.toUpperCase() || '';
    const p2 = partner2Name?.charAt(0)?.toUpperCase() || '';
    if (p1 && p2) return `${p1}+${p2}`;
    if (p1) return p1;
    return '';
  };

  return (
    <div className={cn('relative', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        id="couple-photo-upload"
      />

      <div className="relative">
        <button
          onClick={() => !uploading && setShowOptions(!showOptions)}
          disabled={uploading}
          className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-white shadow-lg focus:outline-none focus:ring-rose-300 transition-all hover:scale-105 active:scale-95"
        >
          {uploading ? (
            <div className="w-full h-full bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          ) : currentPhoto ? (
            <Image
              src={currentPhoto}
              alt="Couple photo"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center">
              {getInitials() ? (
                <span className="text-white font-semibold text-sm">{getInitials()}</span>
              ) : (
                <Heart className="w-6 h-6 text-white fill-white" />
              )}
            </div>
          )}
          
          {/* Camera badge */}
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
            <Camera className="w-3 h-3 text-gray-500" />
          </div>
        </button>

        {/* Options dropdown */}
        <AnimatePresence>
          {showOptions && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setShowOptions(false)}
              />
              
              {/* Menu */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 min-w-[160px]"
              >
                <label
                  htmlFor="couple-photo-upload"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setShowOptions(false)}
                >
                  <Camera className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {currentPhoto ? 'Change photo' : 'Upload photo'}
                  </span>
                </label>
                
                {currentPhoto && (
                  <button
                    onClick={handleRemove}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 w-full text-left transition-colors border-t border-gray-100"
                  >
                    <X className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">Remove photo</span>
                  </button>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 right-0 text-xs text-red-500 bg-white px-2 py-1 rounded shadow-sm whitespace-nowrap"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
