"use client";

import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { LocationData } from '@/types/service-report';

interface Props {
  value: LocationData;
  onChange: (loc: LocationData) => void;
}

export default function LocationPicker({ value, onChange }: Props) {
  const [loading, setLoading] = useState(false);
  const autoFetchAttempted = useRef(false);

  const handleGetLocation = () => {
    setLoading(true);
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onChange({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLoading(false);
        },
        (error) => {
          onChange({ latitude: null, longitude: null, error: error.message });
          setLoading(false);
        },
        { enableHighAccuracy: true } // พยายามดึงให้แม่นยำที่สุด (สำคัญสำหรับมือถือ)
      );
    } else {
      onChange({ latitude: null, longitude: null, error: 'Geolocation not supported' });
      setLoading(false);
    }
  };

  // ดึงตำแหน่งอัตโนมัติเมื่อโหลด Component ครั้งแรก
  useEffect(() => {
    if (!value.latitude && !autoFetchAttempted.current) {
      autoFetchAttempted.current = true;
      handleGetLocation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">พิกัดสถานที่</p>
        <p className="font-medium text-sm">
          {value?.latitude 
            ? `${value.latitude.toFixed(5)}, ${value.longitude?.toFixed(5)}` 
            : (loading ? 'กำลังค้นหาพิกัด...' : (value?.error ? 'ดึงพิกัดอัตโนมัติล้มเหลว' : 'ยังไม่ได้ดึงพิกัด'))}
        </p>
      </div>
      <button 
        type="button" 
        onClick={handleGetLocation}
        className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
        {value?.latitude ? 'อัปเดตพิกัด' : 'ดึงพิกัด'}
      </button>
    </div>
  );
}
