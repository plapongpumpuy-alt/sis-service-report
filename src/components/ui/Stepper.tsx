"use client";

import { Minus, Plus } from 'lucide-react';

interface Props {
  label: string;
  value: number;
  onChange: (val: number) => void;
}

export default function Stepper({ label, value, onChange }: Props) {
  const handleDecrease = () => {
    if (value > 1) onChange(value - 1);
  };

  const handleIncrease = () => {
    onChange(value + 1);
  };

  return (
    <div className="flex items-center justify-between py-2">
      <label className="text-gray-700 font-medium">{label}</label>
      <div className="flex items-center gap-4 bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={handleDecrease}
          className="p-2 bg-white rounded shadow-sm text-gray-600 active:bg-gray-50"
        >
          <Minus className="w-5 h-5" />
        </button>
        <span className="font-semibold text-lg w-8 text-center">{value}</span>
        <button
          type="button"
          onClick={handleIncrease}
          className="p-2 bg-white rounded shadow-sm text-gray-600 active:bg-gray-50"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
