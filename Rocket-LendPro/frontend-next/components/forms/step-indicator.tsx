'use client';

import { cn } from '@/lib/utils/cn';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick?: (step: number) => void;
  className?: string;
}

export function StepIndicator({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  className
}: StepIndicatorProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Mobile: Current step info */}
      <div className="md:hidden mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Step {currentStep} of {steps.length}</span>
          <span>{Math.round((completedSteps.size / steps.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
          />
        </div>
        <div className="mt-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {steps.find(step => step.id === currentStep)?.title}
          </h2>
          <p className="text-sm text-gray-600">
            {steps.find(step => step.id === currentStep)?.description}
          </p>
        </div>
      </div>

      {/* Desktop: Full step indicator */}
      <div className="hidden md:block">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {steps.map((step, stepIdx) => {
              const isCompleted = completedSteps.has(step.id);
              const isCurrent = step.id === currentStep;
              const isClickable = onStepClick && (isCompleted || stepIdx <= currentStep);

              return (
                <li key={step.id} className="flex-1 relative">
                  {/* Step connector line */}
                  {stepIdx !== steps.length - 1 && (
                    <div className="absolute top-4 left-1/2 w-full h-0.5 bg-gray-200 -translate-y-1/2">
                      <div 
                        className={cn(
                          'h-full bg-blue-600 transition-all duration-300',
                          isCompleted || completedSteps.has(steps[stepIdx + 1]?.id) ? 'w-full' : 'w-0'
                        )}
                      />
                    </div>
                  )}

                  <div className="relative flex flex-col items-center group">
                    {/* Step circle */}
                    <button
                      onClick={() => isClickable && onStepClick?.(step.id)}
                      disabled={!isClickable}
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium relative z-10 transition-all duration-200',
                        {
                          'bg-blue-600 text-white': isCurrent,
                          'bg-green-600 text-white': isCompleted && !isCurrent,
                          'bg-gray-200 text-gray-600': !isCurrent && !isCompleted,
                          'cursor-pointer hover:bg-blue-500': isClickable,
                          'cursor-default': !isClickable
                        }
                      )}
                    >
                      {isCompleted && !isCurrent ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span>{step.id}</span>
                      )}
                    </button>

                    {/* Step content */}
                    <div className="mt-2 text-center">
                      <h3 className={cn(
                        'text-sm font-medium',
                        {
                          'text-blue-600': isCurrent,
                          'text-green-600': isCompleted && !isCurrent,
                          'text-gray-500': !isCurrent && !isCompleted
                        }
                      )}>
                        {step.title}
                      </h3>
                      {isCurrent && (
                        <p className="text-xs text-gray-600 mt-1 max-w-24">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}