'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layouts/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/lib/utils/mortgage-utils';
import Image from 'next/image';
import { 
  Search, 
  Filter, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Heart, 
  Calendar,
  Car,
  Waves,
  TrendingUp,
  X,
  SlidersHorizontal
} from 'lucide-react';

// Mock property data
const mockProperties = [
  {
    id: 1,
    address: '123 Main St',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    price: 425000,
    bedrooms: 3,
    bathrooms: 2.5,
    squareFeet: 2100,
    propertyType: 'single-family',
    yearBuilt: 2018,
    lotSize: 0.25,
    hasGarage: true,
    hasPool: false,
    imageUrl: 'https://images.unsplash.com/photo-1605146769289-440113cc3d00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80',
    listingDate: '2024-01-10',
    isFavorited: false,
    description: 'Beautiful modern home in desirable neighborhood'
  },
  {
    id: 2,
    address: '456 Oak Ave',
    city: 'Dallas',
    state: 'TX',
    zipCode: '75201',
    price: 315000,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1800,
    propertyType: 'condo',
    yearBuilt: 2020,
    lotSize: 0,
    hasGarage: true,
    hasPool: true,
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80',
    listingDate: '2024-01-12',
    isFavorited: true,
    description: 'Luxury condo with amenities'
  },
  {
    id: 3,
    address: '789 Pine St',
    city: 'Houston',
    state: 'TX',
    zipCode: '77001',
    price: 385000,
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 2400,
    propertyType: 'single-family',
    yearBuilt: 2015,
    lotSize: 0.33,
    hasGarage: true,
    hasPool: true,
    imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80',
    listingDate: '2024-01-08',
    isFavorited: false,
    description: 'Spacious family home with pool'
  },
  {
    id: 4,
    address: '321 Elm Dr',
    city: 'San Antonio',
    state: 'TX',
    zipCode: '78201',
    price: 275000,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1600,
    propertyType: 'townhouse',
    yearBuilt: 2019,
    lotSize: 0.1,
    hasGarage: false,
    hasPool: false,
    imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80',
    listingDate: '2024-01-14',
    isFavorited: false,
    description: 'Modern townhouse in gated community'
  },
  {
    id: 5,
    address: '654 Maple Ln',
    city: 'Fort Worth',
    state: 'TX',
    zipCode: '76101',
    price: 450000,
    bedrooms: 5,
    bathrooms: 3.5,
    squareFeet: 2800,
    propertyType: 'single-family',
    yearBuilt: 2017,
    lotSize: 0.4,
    hasGarage: true,
    hasPool: true,
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80',
    listingDate: '2024-01-05',
    isFavorited: true,
    description: 'Large executive home with premium features'
  },
  {
    id: 6,
    address: '987 Cedar Ave',
    city: 'Austin',
    state: 'TX',
    zipCode: '78702',
    price: 350000,
    bedrooms: 2,
    bathrooms: 1.5,
    squareFeet: 1400,
    propertyType: 'single-family',
    yearBuilt: 1995,
    lotSize: 0.2,
    hasGarage: false,
    hasPool: false,
    imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80',
    listingDate: '2024-01-11',
    isFavorited: false,
    description: 'Charming starter home with character'
  }
];

const propertyTypeOptions = [
  { value: '', label: 'All Property Types' },
  { value: 'single-family', label: 'Single Family' },
  { value: 'condo', label: 'Condominium' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'multi-family', label: 'Multi-Family' }
];

const sortOptions = [
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'date-desc', label: 'Newest First' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'sqft-desc', label: 'Largest First' },
  { value: 'sqft-asc', label: 'Smallest First' }
];

interface PropertyFilters {
  location: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  propertyType: string;
  hasGarage: boolean;
  hasPool: boolean;
}

export default function PropertySearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 6;

  const [filters, setFilters] = useState<PropertyFilters>({
    location: searchParams.get('location') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    propertyType: searchParams.get('propertyType') || '',
    hasGarage: searchParams.get('hasGarage') === 'true',
    hasPool: searchParams.get('hasPool') === 'true'
  });

  const [favoriteProperties, setFavoriteProperties] = useState<Set<number>>(new Set([2, 5]));

  // Filter and sort properties
  const filteredAndSortedProperties = useMemo(() => {
    let filtered = mockProperties.filter(property => {
      // Location filter
      if (filters.location) {
        const locationMatch = 
          property.city.toLowerCase().includes(filters.location.toLowerCase()) ||
          property.address.toLowerCase().includes(filters.location.toLowerCase()) ||
          property.zipCode.includes(filters.location);
        if (!locationMatch) return false;
      }

      // Price filter
      if (filters.minPrice && property.price < parseInt(filters.minPrice)) return false;
      if (filters.maxPrice && property.price > parseInt(filters.maxPrice)) return false;

      // Bedroom filter
      if (filters.bedrooms && property.bedrooms < parseInt(filters.bedrooms)) return false;

      // Bathroom filter
      if (filters.bathrooms && property.bathrooms < parseFloat(filters.bathrooms)) return false;

      // Property type filter
      if (filters.propertyType && property.propertyType !== filters.propertyType) return false;

      // Feature filters
      if (filters.hasGarage && !property.hasGarage) return false;
      if (filters.hasPool && !property.hasPool) return false;

      return true;
    });

    // Sort properties
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'date-desc':
          return new Date(b.listingDate).getTime() - new Date(a.listingDate).getTime();
        case 'date-asc':
          return new Date(a.listingDate).getTime() - new Date(b.listingDate).getTime();
        case 'sqft-desc':
          return b.squareFeet - a.squareFeet;
        case 'sqft-asc':
          return a.squareFeet - b.squareFeet;
        default:
          return 0;
      }
    });

    return filtered;
  }, [filters, sortBy]);

  // Paginate results
  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * propertiesPerPage;
    const endIndex = startIndex + propertiesPerPage;
    return filteredAndSortedProperties.slice(startIndex, endIndex);
  }, [filteredAndSortedProperties, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedProperties.length / propertiesPerPage);

  const updateFilter = (key: keyof PropertyFilters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      propertyType: '',
      hasGarage: false,
      hasPool: false
    });
    setCurrentPage(1);
  };

  const toggleFavorite = (propertyId: number) => {
    setFavoriteProperties(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId);
      } else {
        newFavorites.add(propertyId);
      }
      return newFavorites;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Property Search
            </h1>
            <p className="text-gray-600">
              Find your perfect home with advanced search and filtering
            </p>
          </div>

          {/* Search and Filter Bar */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Location Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by city, address, or ZIP code"
                      value={filters.location}
                      onChange={(e) => updateFilter('location', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Quick Filters */}
                <div className="flex gap-2">
                  <Select
                    value={sortBy}
                    options={sortOptions}
                    onChange={(e) => setSortBy(e.target.value)}
                  />
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </Button>
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <Input
                      placeholder="Min Price"
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => updateFilter('minPrice', e.target.value)}
                      prefix="$"
                    />
                    
                    <Input
                      placeholder="Max Price"
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilter('maxPrice', e.target.value)}
                      prefix="$"
                    />
                    
                    <Select
                      value={filters.bedrooms}
                      options={[
                        { value: '', label: 'Any Bedrooms' },
                        { value: '1', label: '1+ Bedrooms' },
                        { value: '2', label: '2+ Bedrooms' },
                        { value: '3', label: '3+ Bedrooms' },
                        { value: '4', label: '4+ Bedrooms' },
                        { value: '5', label: '5+ Bedrooms' }
                      ]}
                      onChange={(e) => updateFilter('bedrooms', e.target.value)}
                    />
                    
                    <Select
                      value={filters.bathrooms}
                      options={[
                        { value: '', label: 'Any Bathrooms' },
                        { value: '1', label: '1+ Bathrooms' },
                        { value: '2', label: '2+ Bathrooms' },
                        { value: '3', label: '3+ Bathrooms' }
                      ]}
                      onChange={(e) => updateFilter('bathrooms', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <Select
                      value={filters.propertyType}
                      options={propertyTypeOptions}
                      onChange={(e) => updateFilter('propertyType', e.target.value)}
                    />

                    <Checkbox
                      checked={filters.hasGarage}
                      onCheckedChange={(checked) => updateFilter('hasGarage', checked as boolean)}
                      label="Has Garage"
                    />

                    <Checkbox
                      checked={filters.hasPool}
                      onCheckedChange={(checked) => updateFilter('hasPool', checked as boolean)}
                      label="Has Pool"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              {filteredAndSortedProperties.length} properties found
              {filters.location && ` in ${filters.location}`}
            </p>
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </p>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-200">
                  <Image
                    src={property.imageUrl}
                    alt={`${property.address}, ${property.city}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <button
                    onClick={() => toggleFavorite(property.id)}
                    className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
                  >
                    <Heart 
                      className={`h-4 w-4 ${
                        favoriteProperties.has(property.id) 
                          ? 'text-red-500 fill-red-500' 
                          : 'text-gray-600'
                      }`} 
                    />
                  </button>
                  <div className="absolute bottom-3 left-3">
                    <p className="text-white text-lg font-bold">
                      {formatCurrency(property.price)}
                    </p>
                  </div>
                </div>
                
                <CardContent className="pt-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {property.address}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {property.city}, {property.state} {property.zipCode}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Bed className="h-3 w-3" />
                      {property.bedrooms} bed
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="h-3 w-3" />
                      {property.bathrooms} bath
                    </div>
                    <div className="flex items-center gap-1">
                      <Square className="h-3 w-3" />
                      {property.squareFeet.toLocaleString()} sqft
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    Listed {formatDate(property.listingDate)}
                    {property.hasGarage && (
                      <>
                        <span>•</span>
                        <Car className="h-3 w-3" />
                        <span>Garage</span>
                      </>
                    )}
                    {property.hasPool && (
                      <>
                        <span>•</span>
                        <Waves className="h-3 w-3" />
                        <span>Pool</span>
                      </>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {property.description}
                  </p>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => router.push(`/properties/${property.id}`)}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/mortgage-tools?propertyPrice=${property.price}`)}
                    >
                      <TrendingUp className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredAndSortedProperties.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No properties found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}