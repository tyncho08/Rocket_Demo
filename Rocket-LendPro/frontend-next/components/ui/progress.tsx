import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, showLabel = false, size = 'md', ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div className="w-full" ref={ref} {...props}>
        {showLabel && (
          <div className="flex justify-between text-sm text-gray-700 mb-2">
            <span>Progress</span>
            <span>{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          className={cn(
            'w-full bg-gray-200 rounded-full overflow-hidden',
            {
              'h-1': size === 'sm',
              'h-2': size === 'md',
              'h-3': size === 'lg'
            },
            className
          )}
        >
          <div
            className="bg-blue-600 h-full transition-all duration-300 ease-in-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };