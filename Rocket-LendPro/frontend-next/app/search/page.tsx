'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { Navbar } from '@/components/layouts/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/lib/utils/mortgage-utils';
import { apolloClient } from '@/lib/apollo-client';
import { SEARCH_PROPERTIES_QUERY, TOGGLE_FAVORITE_MUTATION } from '@/lib/graphql/queries';
import { PropertyImage } from '@/components/ui/property-image';
import { 
  Search, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Heart, 
  Calendar,
  TrendingUp,
  SlidersHorizontal
} from 'lucide-react';


const propertyTypeOptions = [
  { value: '', label: 'All Property Types' },
  { value: 'Single Family', label: 'Single Family' },
  { value: 'Condo', label: 'Condominium' },
  { value: 'Townhouse', label: 'Townhouse' },
  { value: 'Loft', label: 'Loft' }
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
}

export default function PropertySearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 6;

  // GraphQL query for properties
  const { data: propertyData, loading: propertiesLoading, error: propertiesError, refetch } = useQuery(
    SEARCH_PROPERTIES_QUERY,
    {
      client: apolloClient,
      variables: {
        first: 50, // Get more properties for client-side filtering and sorting
        search: {}
      },
      errorPolicy: 'all'
    }
  );

  // GraphQL mutation for toggling favorites
  const [toggleFavoriteMutation] = useMutation(TOGGLE_FAVORITE_MUTATION, {
    client: apolloClient,
    onError: (error) => {
      console.error('Error toggling favorite:', error);
    }
  });

  const [filters, setFilters] = useState<PropertyFilters>({
    location: searchParams.get('location') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    propertyType: searchParams.get('propertyType') || ''
  });

  // Get properties from GraphQL only
  const allProperties = propertyData?.properties?.edges?.map((edge: any) => edge.node) || [];
  
  // Debug logging
  console.log('Properties data:', propertyData);
  console.log('Properties loading:', propertiesLoading);
  console.log('Properties error:', propertiesError);
  console.log('All properties:', allProperties.length);
  console.log('Current filters:', filters);

  // Filter and sort properties
  const filteredAndSortedProperties = useMemo(() => {
    let filtered = allProperties.filter(property => {
      // Location filter
      if (filters.location && filters.location.trim()) {
        const locationMatch = 
          property.city.toLowerCase().includes(filters.location.toLowerCase()) ||
          property.address.toLowerCase().includes(filters.location.toLowerCase()) ||
          property.zipCode.includes(filters.location);
        if (!locationMatch) return false;
      }

      // Price filter
      if (filters.minPrice && filters.minPrice.trim() && property.price < parseInt(filters.minPrice)) return false;
      if (filters.maxPrice && filters.maxPrice.trim() && property.price > parseInt(filters.maxPrice)) return false;

      // Bedroom filter
      if (filters.bedrooms && filters.bedrooms.trim() && property.bedrooms < parseInt(filters.bedrooms)) return false;

      // Bathroom filter
      if (filters.bathrooms && filters.bathrooms.trim() && property.bathrooms < parseFloat(filters.bathrooms)) return false;

      // Property type filter - case insensitive matching
      if (filters.propertyType && filters.propertyType.trim() && property.propertyType.toLowerCase() !== filters.propertyType.toLowerCase()) return false;

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
          return new Date(b.listedDate).getTime() - new Date(a.listedDate).getTime();
        case 'date-asc':
          return new Date(a.listedDate).getTime() - new Date(b.listedDate).getTime();
        case 'sqft-desc':
          return b.squareFeet - a.squareFeet;
        case 'sqft-asc':
          return a.squareFeet - b.squareFeet;
        default:
          return 0;
      }
    });

    return filtered;
  }, [allProperties, filters, sortBy]);

  // Debug logging after filtered properties are calculated
  console.log('Filtered properties count:', filteredAndSortedProperties.length);

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
      propertyType: ''
    });
    setCurrentPage(1);
  };

  const toggleFavorite = async (propertyId: number) => {
    try {
      await toggleFavoriteMutation({
        variables: {
          propertyId: propertyId
        }
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
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

          {/* Loading State */}
          {propertiesLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading properties...</p>
            </div>
          )}

          {/* Error State */}
          {propertiesError && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Error loading properties: {propertiesError.message}</p>
              <div className="text-xs text-gray-500 mb-4">
                <pre>{JSON.stringify(propertiesError, null, 2)}</pre>
              </div>
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {/* Results Summary */}
          {!propertiesLoading && !propertiesError && (
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {filteredAndSortedProperties.length} properties found
                {filters.location && ` in ${filters.location}`}
              </p>
              <p className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </p>
            </div>
          )}

          {/* Properties Grid */}
          {!propertiesLoading && !propertiesError && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-200">
                  <PropertyImage
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
                        property.isFavorite 
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
                    Listed {formatDate(property.listedDate)}
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
          )}

          {/* Empty State */}
          {!propertiesLoading && !propertiesError && filteredAndSortedProperties.length === 0 && (
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
          {!propertiesLoading && !propertiesError && totalPages > 1 && (
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