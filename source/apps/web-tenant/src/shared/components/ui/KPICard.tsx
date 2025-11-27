import React from 'react';
import { Card } from './Card';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function KPICard({ title, value, icon: Icon, trend }: KPICardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-3">
          <span className="text-gray-600" style={{ fontSize: '14px' }}>{title}</span>
          <span className="text-gray-900" style={{ fontSize: '32px', fontWeight: 600 }}>{value}</span>
          {trend && (
            <span 
              className={trend.isPositive ? 'text-emerald-600' : 'text-red-500'}
              style={{ fontSize: '13px', fontWeight: 500 }}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-emerald-500" />
        </div>
      </div>
    </Card>
  );
}
