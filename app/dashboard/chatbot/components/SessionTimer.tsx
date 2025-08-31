'use client';

import { useState, useEffect, MutableRefObject } from 'react';
import { ChatSession, Language } from '../page';

interface SessionTimerProps {
  session: ChatSession;
  language: Language;
  onSessionEnd: () => void;
  lastActivityRef: MutableRefObject<Date>;
}

export function SessionTimer({ session, language, onSessionEnd, lastActivityRef }: SessionTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!session.isActive) return;

    const updateTimer = () => {
      const now = Date.now();
      const lastActivity = lastActivityRef.current.getTime();
      const timeSinceActivity = now - lastActivity;
      const remaining = Math.max(0, (15 * 60 * 1000) - timeSinceActivity); // 15 minutes since last activity
      
      setTimeLeft(remaining);

      if (remaining === 0) {
        onSessionEnd();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [session, onSessionEnd, lastActivityRef]);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getInactivityLabel = (language: Language): string => {
    const labels = {
      en: "(due to inactivity)",
      zh: "（由于无活动）",
      vi: "(do không hoạt động)",
      ar: "(بسبب عدم النشاط)",
      hi: "(निष्क्रियता के कारण)",
      id: "(karena tidak aktif)"
    };
    return labels[language];
  };

  if (!session.isActive) return null;
}