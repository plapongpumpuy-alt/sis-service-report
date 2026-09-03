"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Props {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function SearchableSelect({ options, value, onChange, placeholder }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter based on input value
  const filtered = options.filter(opt => opt.toLowerCase().includes((value || '').toLowerCase()));

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input 
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full border border-gray-200 rounded-lg p-3 pr-10 bg-white outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600 flex items-center justify-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {filtered.length > 0 ? (
            <ul className="py-1">
              {filtered.map((opt, i) => (
                <li 
                  key={i}
                  className="px-4 py-3 hover:bg-blue-50 active:bg-blue-100 cursor-pointer text-sm text-gray-700 border-b last:border-b-0 border-gray-50"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                >
                  {opt}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-center text-sm text-gray-500">
              {value ? 'สามารถพิมพ์ชื่อลูกค้าใหม่ได้เลย' : 'ไม่พบข้อมูล'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
