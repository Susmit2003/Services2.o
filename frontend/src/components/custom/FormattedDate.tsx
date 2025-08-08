"use client";

import { useMemo } from 'react';

interface FormattedDateProps {
  date?: string | Date;
}

export function FormattedDate({ date }: FormattedDateProps) {
  const formattedDate: string = useMemo(() => {
    if (!date) return 'N/A';
    try {
      // Formats the date to a more readable local format, e.g., "Aug 7, 2025"
      return new Date(date).toLocaleDateString(undefined, {
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