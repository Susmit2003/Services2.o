"use client";

import { useMemo } from 'react';

interface FormattedDateProps {
  date?: string | Date;
}

export function FormattedDate({ date }: FormattedDateProps) {
  const formattedDate: string = useMemo(() => {
    if (!date) return 'N/A';
    try {
      // Use a fixed locale to avoid SSR/client mismatch
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error("Invalid date provided to FormattedDate:", error);
      return 'Invalid Date';
    }
  }, [date]);

  return <span>{formattedDate}</span>;
}