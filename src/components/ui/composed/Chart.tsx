import { Chart as PRChart, type ChartProps as PRChartProps } from 'primereact/chart';
import { classNames } from 'primereact/utils';

export const Chart = ({ className, ...props }: PRChartProps) => {
  return (
    <div className={classNames('p-6 bg-white rounded-shell border border-border-subtle shadow-soft', className)}>
      <PRChart {...props} />
    </div>
  );
};
