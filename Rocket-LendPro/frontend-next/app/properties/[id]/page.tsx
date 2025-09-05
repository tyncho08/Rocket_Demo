'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layouts/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/mortgage-utils';
import { propertyService, Property } from '@/lib/graphql/services/property.service';
import { 
  ArrowLeft,
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Heart,
  Calendar,
  Car,
  Waves,
  TrendingUp,
  Home,
  Ruler,
  Building
} from 'lucide-react';
import { PropertyImage } from '@/components/ui/property-image';

// Default property image for fallback
const DEFAULT_PROPERTY_IMAGE = 'https://images.unsplash.com/photo-1605146769289-440113cc3d00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const propertyId = parseInt(params.id as string);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId || isNaN(propertyId)) {
        setError('Invalid property ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedProperty = await propertyService.getPropertyById(propertyId);
        setProperty(fetchedProperty);
        setIsFavorited(fetchedProperty.isFavorite || false);
      } catch (err: any) {
        console.error('Error fetching property:', err);
        setError(err.message || 'Failed to load property details');
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  const toggleFavorite = async () => {
    try {
      const result = await propertyService.toggleFavorite(propertyId);
      setIsFavorited(result.isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert the UI state if the API call fails
      // Don't change isFavorited state if the API call fails
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || "The property you're looking for doesn't exist."}
          </p>
          <Button onClick={() => router.push('/search')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Property Image */}
            <div className="lg:col-span-2">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <PropertyImage
                  src={property.imageUrl}
                  alt={`${property.address} - Property Image`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Property Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl font-bold text-blue-600">
                        {formatCurrency(property.price)}
                      </CardTitle>
                      <div className="flex items-center text-gray-600 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{property.address}, {property.city}, {property.state} {property.zipCode}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleFavorite}
                      className={isFavorited ? 'text-red-500' : 'text-gray-400'}
                    >
                      <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Property Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{property.bedrooms} beds</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{property.bathrooms} baths</span>
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{property.squareFeet.toLocaleString()} sqft</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">Listed {new Date(property.listedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm capitalize">{property.propertyType.replace('-', ' ')}</span>
                    </div>
                  </div>


                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      onClick={() => router.push(`/mortgage-tools?propertyPrice=${property.price}`)}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Calculate Mortgage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {property.description}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Property Details Table */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Type:</span>
                    <span className="font-medium capitalize">{property.propertyType.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Square Feet:</span>
                    <span className="font-medium">{property.squareFeet.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bedrooms:</span>
                    <span className="font-medium">{property.bedrooms}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bathrooms:</span>
                    <span className="font-medium">{property.bathrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Listed Date:</span>
                    <span className="font-medium">{new Date(property.listedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">{property.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}