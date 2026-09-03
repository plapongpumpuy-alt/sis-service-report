"use client";

import { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser } from 'lucide-react';

interface Props {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

export default function SignaturePad({ label, value, onChange }: Props) {
  const sigCanvas = useRef<any>(null);

  const clear = () => {
    sigCanvas.current?.clear();
    onChange('');
  };

  const handleEnd = () => {
    if (sigCanvas.current) {
      onChange(sigCanvas.current.toDataURL());
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-gray-700 font-medium text-sm">{label}</label>
        <button
          type="button"
          onClick={clear}
          className="flex items-center gap-1 text-red-500 text-xs font-medium bg-red-50 px-2 py-1 rounded"
        >
          <Eraser className="w-3 h-3" />
          ล้าง
        </button>
      </div>
      <div className="border-2 border-dashed border-gray-300 rounded-xl bg-white overflow-hidden relative touch-none">
        {/* We use touch-none to prevent scrolling on mobile while signing */}
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: 'w-full h-32'
          }}
          onEnd={handleEnd}
        />
        {!value && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <span className="text-gray-300 text-sm">เซ็นชื่อที่นี่</span>
          </div>
        )}
      </div>
    </div>
  );
}
