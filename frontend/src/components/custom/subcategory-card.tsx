import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface SubcategoryCardProps {
  category: {
    name: string;
    query: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
  };
  subcategory: {
    name: string;
    query: string;
    icon?: React.ComponentType<{ className?: string }>;
    color?: string;
  };
}

export function SubcategoryCard({ category, subcategory }: SubcategoryCardProps) {
  return (
    <Link href={`/all-services?category=${category.query}&subcategory=${subcategory.query}`}>
      <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col">
        <CardHeader className="items-center text-center p-6 flex-grow">
          {subcategory.icon && (
            <div className={`p-3 rounded-full ${category.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <subcategory.icon className={`h-8 w-8 ${subcategory.color || category.color}`} />
            </div>
          )}
          <CardTitle className="font-headline text-lg">{subcategory.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-shrink-0 flex items-end justify-center p-4 pt-0">
          <Button variant="ghost" className="text-sm text-primary group-hover:underline">
            View Services <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
} 