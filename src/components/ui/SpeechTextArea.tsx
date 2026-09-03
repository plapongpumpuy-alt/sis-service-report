"use client";

import { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function SpeechTextArea({ value, onChange }: Props) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.lang = 'th-TH'; // Thai language
        recog.continuous = true;
        recog.interimResults = true;

        recog.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          // Note: for a more robust implementation, interim results handling is needed
          // Here we do a simple concatenation for demonstration
          if (event.results[event.results.length - 1].isFinal) {
             onChange(value + (value ? ' ' : '') + transcript);
          }
        };

        recog.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recog.onend = () => {
          setIsListening(false);
        }

        setRecognition(recog);
      }
    }
  }, [value, onChange]);

  const toggleListen = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      recognition?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border rounded-lg p-3 min-h-[120px] pb-12 focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="พิมพ์รายละเอียด หรือกดปุ่มไมค์เพื่อพูด..."
        />
        <button
          type="button"
          onClick={toggleListen}
          className={`absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors shadow-sm ${
            isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          {isListening ? 'กำลังฟัง...' : 'พูดเพื่อพิมพ์'}
        </button>
      </div>
    </div>
  );
}
