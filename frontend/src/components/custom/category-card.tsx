import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CategoryCardProps {
  category: {
    name: string;
    query: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    subcategories: Array<{
      name: string;
      query: string;
      icon?: React.ComponentType<{ className?: string }>;
      color?: string;
    }>;
  };
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/all-services?category=${category.query}`}>
      <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col">
        <CardHeader className="items-center text-center p-6">
          <div className={`p-4 rounded-full ${category.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
            <category.icon className={`h-10 w-10 ${category.color}`} />
          </div>
          <CardTitle className="font-headline text-xl">{category.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex items-end justify-center p-4 pt-0">
          <Button variant="ghost" className="text-sm text-primary group-hover:underline">
            Explore <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
} 