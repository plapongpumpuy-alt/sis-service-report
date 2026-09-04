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
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          let addressStr = '';
          try {
             const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=th`);
             const data = await res.json();
             if (data && data.display_name) {
                // Shorten by removing the country name to keep it concise
                addressStr = data.display_name.replace(', ประเทศไทย', '').replace(', Thailand', '');
             }
          } catch (e) {
             console.error("Reverse geocoding failed", e);
          }

          onChange({
            latitude: lat,
            longitude: lon,
            address: addressStr
          });
          setLoading(false);
        },
        (error) => {
          onChange({ latitude: null, longitude: null, error: error.message });
          setLoading(false);
        },
        { enableHighAccuracy: true }
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
      <div className="flex-1 pr-4">
        <p className="text-sm text-gray-600 mb-1">พิกัดสถานที่</p>
        <p className="font-medium text-sm">
          {value?.latitude 
            ? `${value.latitude.toFixed(5)}, ${value.longitude?.toFixed(5)}` 
            : (loading ? 'กำลังค้นหาพิกัด...' : (value?.error ? 'ดึงพิกัดอัตโนมัติล้มเหลว' : 'ยังไม่ได้ดึงพิกัด'))}
        </p>
        {value?.address && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2" title={value.address}>
            {value.address}
          </p>
        )}
      </div>
      <button 
        type="button" 
        onClick={handleGetLocation}
        className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium shrink-0"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
        {value?.latitude ? 'อัปเดตพิกัด' : 'ดึงพิกัด'}
      </button>
    </div>
  );
}
