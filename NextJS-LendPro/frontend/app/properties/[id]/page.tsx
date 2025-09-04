'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layouts/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/mortgage-utils';
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
import Image from 'next/image';

// Mock property data - in real app this would come from API
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
    imageUrl: 'https://images.unsplash.com/photo-1605146769289-440113cc3d00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    listingDate: '2024-01-10',
    isFavorited: false,
    description: 'Beautiful modern home in desirable neighborhood with excellent schools and convenient access to downtown Austin.',
    agent: {
      name: 'Sarah Martinez',
      email: 'sarah.martinez@lendpro.com',
      phone: '(512) 555-0123',
      company: 'LendPro Realty'
    },
    features: [
      'Open floor plan',
      'Updated kitchen',
      'Hardwood floors',
      'Central air/heat',
      'Fenced yard',
      'Storage shed'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1605146769289-440113cc3d00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2058&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    ]
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
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    listingDate: '2024-01-12',
    isFavorited: true,
    description: 'Luxury condo with premium amenities including pool, fitness center, and concierge services.',
    agent: {
      name: 'Michael Chen',
      email: 'michael.chen@lendpro.com',
      phone: '(214) 555-0456',
      company: 'LendPro Realty'
    },
    features: [
      'Floor-to-ceiling windows',
      'Granite countertops',
      'Stainless steel appliances',
      'In-unit laundry',
      'Balcony with city views',
      'Assigned parking'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
      'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    ]
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
    imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    listingDate: '2024-01-08',
    isFavorited: false,
    description: 'Spacious family home with pool, perfect for entertaining and family gatherings.',
    agent: {
      name: 'Jennifer Lopez',
      email: 'jennifer.lopez@lendpro.com',
      phone: '(713) 555-0789',
      company: 'LendPro Realty'
    },
    features: [
      'Swimming pool',
      'Large deck',
      'Master suite',
      'Walk-in closets',
      '2-car garage',
      'Sprinkler system'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1574691250077-03a929faece5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2026&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80'
    ]
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
    lotSize: 0.15,
    hasGarage: true,
    hasPool: false,
    imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2126&q=80',
    listingDate: '2024-01-15',
    isFavorited: true,
    description: 'Modern townhouse in gated community with excellent location and amenities.',
    agent: {
      name: 'David Rodriguez',
      email: 'david.rodriguez@lendpro.com',
      phone: '(210) 555-0321',
      company: 'LendPro Realty'
    },
    features: [
      'Gated community',
      'Attached garage',
      'Patio area',
      'Energy efficient',
      'HOA amenities',
      'Low maintenance'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2126&q=80',
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1593696140826-c58b021acf8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80'
    ]
  }
];

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const propertyId = parseInt(params.id as string);
    const foundProperty = mockProperties.find(p => p.id === propertyId);
    
    if (foundProperty) {
      setProperty(foundProperty);
      setIsFavorited(foundProperty.isFavorited);
    }
    setLoading(false);
  }, [params.id]);

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    // In real app, this would update the backend
  };

  const showContactInfo = () => {
    if (property && property.agent) {
      alert(`Contact Agent: ${property.agent.name}\nEmail: ${property.agent.email}\nPhone: ${property.agent.phone}`);
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

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist.</p>
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
            {/* Image Gallery */}
            <div className="lg:col-span-2 space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={property.gallery[selectedImage]}
                  alt={`${property.address} - Image ${selectedImage + 1}`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              
              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 gap-2">
                {property.gallery.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-video rounded overflow-hidden border-2 ${
                      selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
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
                      <span className="text-sm">Built {property.yearBuilt}</span>
                    </div>
                    {property.lotSize > 0 && (
                      <div className="flex items-center">
                        <Ruler className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm">{property.lotSize} acres</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm capitalize">{property.propertyType.replace('-', ' ')}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex gap-2 flex-wrap">
                    {property.hasGarage && (
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        <Car className="h-3 w-3" /> Garage
                      </span>
                    )}
                    {property.hasPool && (
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        <Waves className="h-3 w-3" /> Pool
                      </span>
                    )}
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
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={showContactInfo}
                    >
                      Contact Agent
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Description and Features */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
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

            <Card>
              <CardHeader>
                <CardTitle>Features & Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 gap-2">
                  {property.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
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
                    <span className="text-gray-600">Year Built:</span>
                    <span className="font-medium">{property.yearBuilt}</span>
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
                  {property.lotSize > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lot Size:</span>
                      <span className="font-medium">{property.lotSize} acres</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Garage:</span>
                    <span className="font-medium">{property.hasGarage ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pool:</span>
                    <span className="font-medium">{property.hasPool ? 'Yes' : 'No'}</span>
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