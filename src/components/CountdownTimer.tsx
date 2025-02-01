import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  date: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function CountdownTimer({ date }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(date).getTime() - new Date().getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [date]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 flex items-center gap-4">
      <Clock className="text-purple-500 w-6 h-6" />
      <div className="flex gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{formatNumber(timeLeft.days)}</div>
          <div className="text-xs text-gray-500">Dias</div>
        </div>
        <div className="text-2xl font-bold text-gray-400">:</div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{formatNumber(timeLeft.hours)}</div>
          <div className="text-xs text-gray-500">Horas</div>
        </div>
        <div className="text-2xl font-bold text-gray-400">:</div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{formatNumber(timeLeft.minutes)}</div>
          <div className="text-xs text-gray-500">Min</div>
        </div>
        <div className="text-2xl font-bold text-gray-400">:</div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{formatNumber(timeLeft.seconds)}</div>
          <div className="text-xs text-gray-500">Seg</div>
        </div>
      </div>
    </div>
  );
}

export default CountdownTimer;