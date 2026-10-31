import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'active'
  | 'paused'
  | 'draft'
  | 'quotation'
  | 'confirmed'
  | 'closed'
  | 'paid'
  | 'overdue'
  | 'terracotta'
  | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
}) => {
  const styles: Record<BadgeVariant, { bg: string; dotColor: string }> = {
    default: {
      bg: 'bg-[#F0EFEA] text-ink border-[#DDDCD6]',
      dotColor: 'bg-ink',
    },
    active: {
      bg: 'bg-[#EBF7EE] text-[#1E6930] border-[#C8E8CE]',
      dotColor: 'bg-[#22843A]',
    },
    paid: {
      bg: 'bg-[#EBF7EE] text-[#1E6930] border-[#C8E8CE]',
      dotColor: 'bg-[#22843A]',
    },
    confirmed: {
      bg: 'bg-[#EEF2FC] text-[#244A9E] border-[#CFDBF7]',
      dotColor: 'bg-[#244A9E]',
    },
    quotation: {
      bg: 'bg-[#F2F0FB] text-[#4E35A8] border-[#D9D3F3]',
      dotColor: 'bg-[#4E35A8]',
    },
    paused: {
      bg: 'bg-[#FEF6E8] text-[#8C5808] border-[#F8E3BD]',
      dotColor: 'bg-[#D98207]',
    },
    draft: {
      bg: 'bg-[#F4F4F1] text-secondary border-[#E2E0DB]',
      dotColor: 'bg-muted',
    },
    closed: {
      bg: 'bg-[#F0EFEA] text-muted border-[#E2E0DB]',
      dotColor: 'bg-muted',
    },
    overdue: {
      bg: 'bg-terracotta-light text-terracotta border-[#F5C6BE]',
      dotColor: 'bg-terracotta',
    },
    terracotta: {
      bg: 'bg-terracotta text-white border-terracotta',
      dotColor: 'bg-white',
    },
    outline: {
      bg: 'bg-transparent text-ink border-border',
      dotColor: 'bg-ink',
    },
  };

  const selected = styles[variant] || styles.default;
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1.5' : 'text-xs px-2.5 py-1 gap-2';

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-sm tracking-tight select-none uppercase font-mono ${selected.bg} ${sizeClass}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${selected.dotColor}`} />}
      {children}
    </span>
  );
};
