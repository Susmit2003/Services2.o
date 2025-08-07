"use client";

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, X, Loader2, LayoutGrid } from 'lucide-react';
import { serviceHierarchy } from '@/lib/constants'; // This is our single source of truth for UI
import { ServiceCard } from './service-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { Service } from '@/types';
import Link from 'next/link';

interface ServicesPageClientProps {
  initialServices: Service[] | null;
  initialFilters: {
    category: string;
    subcategory: string;
    searchTerm: string;
    pincode: string;
    rating: string;
  };
}

export function ServicesPageClient({ initialServices, initialFilters }: ServicesPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // --- FIX: This is the core logic fix ---
  // We derive the currently selected category directly from our frontend constant.
  const selectedCategoryData = useMemo(() => 
    serviceHierarchy.find(c => c.query === filters.category),
    [filters.category]
  );

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.pincode) params.set('pincode', filters.pincode);
    if (filters.searchTerm) params.set('searchTerm', filters.searchTerm);
    if (filters.rating) params.set('rating', filters.rating);

    startTransition(() => {
      router.push(`/all-services?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setFilters({ category: '', subcategory: '', searchTerm: '', pincode: '', rating: '' });
    startTransition(() => {
      router.push('/all-services');
    });
  };
  
  const services = initialServices || [];
  
  // --- FIX: Updated rendering conditions ---
  const showMainCategories = !filters.category;
  const showSubcategories = selectedCategoryData && !filters.subcategory; // Show subcategories if a main category is selected
  const showServicesList = !!filters.subcategory || !!initialFilters.pincode || !!initialFilters.searchTerm;

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Find Your Perfect Service</h1>
        <p className="mt-4 text-lg text-muted-foreground">Search by keyword and pincode, or browse our categories.</p>
      </header>
      
      {/* ... (Filter bar JSX remains the same) ... */}
      <div className="mb-8 p-6 bg-muted/50 rounded-xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="lg:col-span-2">
                <Label htmlFor="search-input" className="text-sm font-medium">Service or Provider</Label>
                <Input id="search-input" placeholder="e.g., House Cleaning..." value={filters.searchTerm} onChange={e => handleFilterChange('searchTerm', e.target.value)} className="h-11"/>
              </div>
              <div>
                <Label htmlFor="pincode-input" className="text-sm font-medium">PIN/ZIP Code</Label>
                <Input id="pincode-input" placeholder="Your local pincode" value={filters.pincode} onChange={e => handleFilterChange('pincode', e.target.value)} className="h-11"/>
              </div>
              <div>
                <Label htmlFor="rating-select" className="text-sm font-medium">Minimum Rating</Label>
                <Select value={filters.rating} onValueChange={value => handleFilterChange('rating', value === 'all' ? '' : value)}>
                    <SelectTrigger id="rating-select" className="h-11"><SelectValue placeholder="Any" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Any Rating</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="3">3+ Stars</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSearch} className="w-full h-11">
                  <Search className="w-4 h-4 mr-2" /> Search
              </Button>
          </div>
      </div>
      <Separator className="my-8" />
      
      {isPending ? (
        <div className="text-center py-16"><Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" /><p className="mt-4 text-muted-foreground">Loading...</p></div>
      ) : showServicesList ? (
        services.length > 0 ? (
            <div>
              <h2 className="font-headline text-2xl font-semibold mb-6">Search Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {services.map(service => ( <ServiceCard key={service._id} service={service} /> ))}
              </div>
            </div>
        ) : (
            <div className="text-center py-16">
                <LayoutGrid className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="font-headline text-2xl">No Services Found</h3>
                <p className="mt-2 text-muted-foreground">Try adjusting your search or pincode.</p>
                <Button variant="outline" onClick={clearFilters} className="mt-6"><X className="w-4 h-4 mr-2" /> Clear Search</Button>
            </div>
        )
      ) : showSubcategories ? (
        // --- This block now correctly displays subcategories ---
        <div>
            <h2 className="font-headline text-2xl font-semibold mb-6">Subcategories in {selectedCategoryData.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {selectedCategoryData.subcategories.map((subcategory) => (
                <Link key={subcategory.name} href={`/all-services?category=${selectedCategoryData.query}&subcategory=${subcategory.query}`}>
                <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all h-full">
                    <CardHeader className="items-center text-center p-6">
                    <div className={`p-4 rounded-full ${selectedCategoryData.bgColor} mb-4`}>
                        {subcategory.icon && <subcategory.icon className={`h-10 w-10 ${subcategory.color || selectedCategoryData.color}`} />}
                    </div>
                    <CardTitle className="font-headline text-xl">{subcategory.name}</CardTitle>
                    </CardHeader>
                </Card>
                </Link>
            ))}
            </div>
        </div>
      ) : (
        // Default view: Show Main Categories
        <div>
            <h2 className="font-headline text-2xl font-semibold mb-6">Browse by Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {serviceHierarchy.map((category) => (
                <Link key={category.name} href={`/all-services?category=${category.query}`}>
                <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all h-full">
                    <CardHeader className="items-center text-center p-6">
                    <div className={`p-4 rounded-full ${category.bgColor} mb-4`}>
                        <category.icon className={`h-10 w-10 ${category.color}`} />
                    </div>
                    <CardTitle className="font-headline text-xl">{category.name}</CardTitle>
                    </CardHeader>
                </Card>
                </Link>
            ))}
            </div>
        </div>
      )}
    </div>
  );
}