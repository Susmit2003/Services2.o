"use client";

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
  size?: number;
}

export function RatingStars({ rating, onRatingChange, interactive = false, size = 20 }: RatingStarsProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((starValue) => (
        <Star
          key={starValue}
          className={cn(
            'transition-colors',
            starValue <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600',
            interactive && 'cursor-pointer hover:text-yellow-400'
          )}
          style={{ width: size, height: size }}
          onClick={() => interactive && onRatingChange?.(starValue)}
        />
      ))}
    </div>
  );
}