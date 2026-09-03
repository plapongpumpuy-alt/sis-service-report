"use client";

import { Camera, X } from 'lucide-react';
import { useRef } from 'react';

interface Props {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export default function PhotoCapture({ photos, onChange, maxPhotos = 4 }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos = [...photos];
      let filesProcessed = 0;
      
      Array.from(files).forEach(file => {
        if (newPhotos.length + filesProcessed < maxPhotos) {
          filesProcessed++;
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
               newPhotos.push(reader.result);
               onChange([...newPhotos]);
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    onChange(newPhotos);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-gray-700 font-medium text-sm">รูปภาพหน้างาน ({photos.length}/{maxPhotos})</label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={photos.length >= maxPhotos}
          className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          <Camera className="w-4 h-4" />
          ถ่ายรูป
        </button>
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          multiple
          className="hidden" 
          ref={fileInputRef}
          onChange={handleCapture}
        />
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {photos.map((photo, index) => (
            <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt={`Captured ${index + 1}`} className="object-cover w-full h-full" />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
