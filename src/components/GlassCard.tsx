import React from 'react';
import { cn } from '../lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function GlassCard({ children, className, hoverEffect = false, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "bg-white/40 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.1),inset_0_0_0_1px_rgba(255,255,255,0.3)] rounded-3xl",
        hoverEffect && "transition-all duration-300 hover:shadow-[0_16px_48px_0_rgba(31,38,135,0.15),inset_0_0_0_1px_rgba(255,255,255,0.4)] hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
