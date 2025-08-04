"use client";

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ListFilter, Search, Star, MapPin, Clock, User, ArrowRight, Sparkles, Wrench, Paintbrush, Stethoscope, Car, Home, Utensils, Palette, Camera, Dumbbell, BookOpen, Music, Gamepad2, Heart, Shield, Zap, Users, Award, TrendingUp } from 'lucide-react';
import { serviceHierarchy } from '@/lib/constants';
import { ServiceCard } from './service-card';
import { CategoryCard } from './category-card';
import { SubcategoryCard } from './subcategory-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getServices } from '@/lib/actions/service.actions';
import useSWR from 'swr';
import type { Service } from '@/types';

interface ServicesPageClientProps {
  initialServices: Service[];
  initialFilters: {
    category: string;
    subcategory: string;
    searchTerm: string;
    pincode: string;
    rating: string;
  };
}

type Filters = ServicesPageClientProps['initialFilters'];

const FilterInputs = ({ filters, handleFilterChange }: { filters: Filters, handleFilterChange: (key: keyof Filters, value: string) => void }) => (
  <>
    <div className="space-y-1">
      <Label htmlFor="search-filter" className="text-sm font-medium text-muted-foreground flex items-center">
        <Search className="w-4 h-4 mr-1" /> Service or Provider
      </Label>
      <Input
        id="search-filter"
        placeholder="e.g., House Cleaning, Alice Wonderland"
        value={filters.searchTerm}
        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
        className="h-11 bg-background"
      />
    </div>
    <div className="space-y-1">
      <Label htmlFor="pincode-filter" className="text-sm font-medium text-muted-foreground flex items-center">
        <MapPin className="w-4 h-4 mr-1" /> PIN/ZIP Code
      </Label>
      <Input
        id="pincode-filter"
        placeholder="Enter your PIN/ZIP code"
        value={filters.pincode}
        onChange={(e) => handleFilterChange('pincode', e.target.value)}
        className="h-11 bg-background"
      />
    </div>
    <div className="space-y-1">
      <Label htmlFor="rating-filter" className="text-sm font-medium text-muted-foreground flex items-center">
        <Star className="w-4 h-4 mr-1" /> Minimum Rating
      </Label>
      <Select value={filters.rating} onValueChange={(value) => handleFilterChange('rating', value)}>
        <SelectTrigger className="h-11 bg-background">
          <SelectValue placeholder="Any rating" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Any rating</SelectItem>
          <SelectItem value="4">4+ stars</SelectItem>
          <SelectItem value="3">3+ stars</SelectItem>
          <SelectItem value="2">2+ stars</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </>
);

const FilterControls = ({ 
  inSheet = false, 
  filters, 
  handleFilterChange, 
  updateUrl, 
  setFilters 
}: { 
  inSheet?: boolean,
  filters: Filters, 
  handleFilterChange: (key: keyof Filters, value: string) => void,
  updateUrl: () => void,
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
}) => {
  return (
    <div className={`space-y-4 ${inSheet ? '' : 'grid grid-cols-1 md:grid-cols-3 gap-4'}`}>
      <FilterInputs filters={filters} handleFilterChange={handleFilterChange} />
      <div className="flex gap-2">
        <Button onClick={updateUrl} className="flex-1">
          Apply Filters
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setFilters({ category: '', subcategory: '', searchTerm: '', pincode: '', rating: '' })}
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export function ServicesPageClient({ initialServices, initialFilters }: ServicesPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const selectedCategoryData = useMemo(() => 
      serviceHierarchy.find(c => c.query === filters.category),
      [filters.category]
  );

  // SWR for real-time data fetching
  const shouldFetchServices = filters.category && (filters.subcategory || (selectedCategoryData && selectedCategoryData.subcategories.length === 0));
  
  const { data: services = initialServices, error, mutate } = useSWR(
    shouldFetchServices ? ['services', filters] : null,
    async () => {
      const categoryName = selectedCategoryData?.name || '';
      const subcategoryName = selectedCategoryData?.subcategories.find(sc => sc.query === filters.subcategory)?.name || '';
      
      return await getServices({
        category: categoryName,
        subcategory: subcategoryName,
        search: filters.searchTerm,
        pincode: filters.pincode,
        rating: filters.rating,
      });
    },
    {
      fallbackData: initialServices,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  );

  // Function to refresh services data
  const refreshServices = () => {
    mutate();
  };
  
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({...prev, [key]: value}));
  };

  const updateUrl = () => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.subcategory) params.set('subcategory', filters.subcategory);
    if (filters.searchTerm) params.set('searchTerm', filters.searchTerm);
    if (filters.pincode) params.set('pincode', filters.pincode);
    if (filters.rating) params.set('rating', filters.rating);
    
    startTransition(() => {
      router.push(`/all-services?${params.toString()}`);
    });
    setIsFilterSheetOpen(false);
  };
  
  const clearFiltersAndUrl = () => {
    setFilters({ category: '', subcategory: '', searchTerm: '', pincode: '', rating: '' });
    startTransition(() => {
      router.push('/all-services');
    });
    setIsFilterSheetOpen(false);
  };

  const Breadcrumbs = () => {
    if (!filters.category) return null;
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
        <button onClick={clearFiltersAndUrl} className="hover:text-primary">All Categories</button>
        {selectedCategoryData && (
          <>
            <span>/</span>
            {filters.subcategory ? (
              <button onClick={() => {
                  startTransition(() => {
                    router.push(`/all-services?category=${filters.category}`);
                  });
              }} className="hover:text-primary">{selectedCategoryData.name}</button>
            ) : (
              <span className="font-semibold text-foreground">{selectedCategoryData.name}</span>
            )}
          </>
        )}
        {filters.subcategory && selectedCategoryData && (
          <>
            <span>/</span>
            <span className="font-semibold text-foreground">
                {selectedCategoryData.subcategories.find(sc => sc.query === filters.subcategory)?.name}
            </span>
          </>
        )}
      </div>
    );
  };
  
  const getPageTitle = () => {
    if (filters.subcategory && selectedCategoryData) {
      return selectedCategoryData.subcategories.find(sc => sc.query === filters.subcategory)?.name || 'Services';
    }
    if (selectedCategoryData) {
      return selectedCategoryData.name;
    }
    return 'Browse Services By Category';
  };
  
  const getPageDescription = () => {
    if (filters.category) return "Find top-rated professionals for your needs.";
    return "Select a category to find top-rated professionals for your home service needs.";
  }

  const isLoading = isPending || (shouldFetchServices && !services && !error);
  const currentServices = services || [];

  const showMainCategories = !filters.category;
  const showSubcategories = selectedCategoryData && selectedCategoryData.subcategories.length > 0 && !filters.subcategory;
  const showServicesList = (selectedCategoryData && selectedCategoryData.subcategories.length === 0) || !!filters.subcategory;

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
         <Breadcrumbs />
        <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">
          {getPageTitle()}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
          {getPageDescription()}
        </p>
      </header>

      <div className="lg:hidden mb-6 flex justify-end">
        <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="lg">
              <ListFilter className="mr-2 h-5 w-5" /> Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Filter Services</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterControls 
                inSheet={true}
                filters={filters} 
                handleFilterChange={handleFilterChange} 
                updateUrl={updateUrl}
                setFilters={setFilters}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Categories */}
      {showMainCategories && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {serviceHierarchy.map((category) => (
            <CategoryCard key={category.query} category={category} />
          ))}
        </div>
      )}

      {/* Subcategories */}
      {showSubcategories && selectedCategoryData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {selectedCategoryData.subcategories.map((subcategory) => (
            <SubcategoryCard 
              key={subcategory.query} 
              category={selectedCategoryData} 
              subcategory={subcategory} 
            />
          ))}
        </div>
      )}

      {/* Services List */}
      {showServicesList && (
        <>
          {/* Desktop Filters */}
          <div className="hidden lg:block mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListFilter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FilterControls 
                  filters={filters} 
                  handleFilterChange={handleFilterChange} 
                  updateUrl={updateUrl}
                  setFilters={setFilters}
                />
              </CardContent>
            </Card>
          </div>

          {/* Services Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 bg-muted rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Failed to load services. Please try again.</p>
                  <Button onClick={refreshServices} variant="outline">
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : currentServices.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No services found for the selected criteria.</p>
                  <Button onClick={clearFiltersAndUrl} variant="outline" className="mt-4">
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentServices.map((service: Service) => (
                <ServiceCard 
                  key={service.id} 
                  service={service} 
                  onActionComplete={refreshServices}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}