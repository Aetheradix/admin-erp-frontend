import { useMemo } from 'react';

export const useCalendarData = () => {
  const days = useMemo(() => Array.from({ length: 30 }), []);
  
  const indicators = {
    emerald: [3, 9, 14, 15, 22],
    rose: [2, 10, 24],
    bold: [10, 14, 22],
    avatars: [9, 14, 22]
  };

  const isEmerald = (day: number) => indicators.emerald.includes(day);
  const isRose = (day: number) => indicators.rose.includes(day);
  const isBold = (day: number) => indicators.bold.includes(day);
  const hasAvatar = (day: number) => indicators.avatars.includes(day);

  return { days, isEmerald, isRose, isBold, hasAvatar };
};
