'use client';

import { useState, useEffect } from 'react';
import { ChatSession, Language } from '../page';

interface SessionTimerProps {
  session: ChatSession;
  language: Language;
  onSessionEnd: () => void;
}

export function SessionTimer({ session, language, onSessionEnd }: SessionTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!session.isActive) return;

    const updateTimer = () => {
      const elapsed = Date.now() - session.startTime.getTime();
      const remaining = Math.max(0, (15 * 60 * 1000) - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0) {
        onSessionEnd();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [session, onSessionEnd]);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimerLabel = (language: Language): string => {
    const labels = {
      en: "Time left:",
      zh: "剩余时间：",
      vi: "Thời gian còn lại:",
      ar: "الوقت المتبقي:",
      hi: "बचा हुआ समय:",
      id: "Waktu tersisa:"
    };
    return labels[language];
  };

  if (!session.isActive) return null;

  return (
    <div className="text-sm text-blue-100">
      <span>{getTimerLabel(language)} </span>
      <span className={`font-mono ${timeLeft < 300000 ? 'text-yellow-300' : ''}`}>
        {formatTime(timeLeft)}
      </span>
    </div>
  );
}