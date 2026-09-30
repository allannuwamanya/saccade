import React from 'react';
import { Card, CardContent } from './Card';

interface StatProps {
  label: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

export const Stat: React.FC<StatProps> = ({ label, value, trend, icon }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[var(--text-sm)] font-medium text-[var(--color-text-muted)]">
              {label}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-[var(--text-3xl)] font-semibold text-[var(--color-text-primary)]">
                {value}
              </p>
              {trend && (
                <span className={`text-[var(--text-sm)] font-medium ${trend.isPositive ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                  {trend.isPositive ? '+' : ''}{trend.value}
                </span>
              )}
            </div>
          </div>
          {icon && (
            <div className="p-3 bg-[var(--color-surface-2)] rounded-lg text-[var(--color-text-secondary)]">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
