import { useEffect, useRef } from 'react';
import { Chart as ChartJS } from 'chart.js/auto';
import { cn } from '@/utils/cn';

interface ChartProps {
  type: string;
  data: Record<string, unknown>;
  options?: Record<string, unknown>;
  className?: string;
}

export const Chart = ({ type, data, options, className }: ChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    chartRef.current?.destroy();
    chartRef.current = new ChartJS(canvasRef.current, {
      type: type as never,
      data: data as never,
      options: options as never,
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [type, data, options]);

  return (
    <div
      className={cn(
        'p-6 bg-white rounded-shell border border-border-subtle shadow-soft',
        className
      )}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};
