'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Navbar } from '@/components/layouts/navbar';
import Link from 'next/link';
import { PropertyImage } from '@/components/ui/property-image';
import { propertyService, Property } from '@/lib/graphql/services/property.service';
import { GET_MY_LOAN_APPLICATIONS_QUERY } from '@/lib/graphql/queries';
import { useMortgageStore } from '@/lib/store/use-mortgage-store';
import { 
  User, 
  FileText, 
  Calculator, 
  Heart, 
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Plus,
  Download,
  Eye
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/mortgage-utils';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'properties' | 'calculations'>('overview');
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  
  const { history } = useMortgageStore();
  const user = session?.user;

  // GraphQL query for loan applications
  const { data: loanApplicationsData, loading: loanApplicationsLoading } = useQuery(GET_MY_LOAN_APPLICATIONS_QUERY, {
    variables: { first: 10 },
    skip: !session?.accessToken
  });

  const loanApplications = loanApplicationsData?.myLoanApplications?.edges?.map((edge: any) => edge.node) || [];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = (status: string, createdAt: string) => {
    const daysSinceCreated = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    switch (status.toLowerCase()) {
      case 'pending':
        return Math.min(daysSinceCreated * 10, 70); // Progress based on days since created
      case 'approved':
        return 100;
      case 'rejected':
        return 100;
      default:
        return 0;
    }
  };

  // Function to refresh favorite properties
  const refreshFavoriteProperties = async () => {
    try {
      const favorites = await propertyService.getFavoriteProperties();
      setFavoriteProperties(favorites);
    } catch (error) {
      console.error('Error refreshing favorite properties:', error);
    }
  };

  // Fetch favorite properties count on initial load
  useEffect(() => {
    const fetchFavoriteCount = async () => {
      // Wait a bit for session to be established
      if (status === 'loading') return;
      if (!session?.accessToken) return;
      
      try {
        const favorites = await propertyService.getFavoriteProperties();
        setFavoriteProperties(favorites);
      } catch (error) {
        console.error('Error fetching favorite properties:', error);
        setFavoriteProperties([]);
      }
    };

    fetchFavoriteCount();
  }, [session?.accessToken, status]);

  // Fetch favorite properties when the properties tab is selected
  useEffect(() => {
    const fetchFavoriteProperties = async () => {
      if (activeTab === 'properties' && session?.accessToken && status === 'authenticated') {
        setLoadingFavorites(true);
        try {
          const favorites = await propertyService.getFavoriteProperties();
          setFavoriteProperties(favorites);
        } catch (error) {
          console.error('Error fetching favorite properties:', error);
          setFavoriteProperties([]);
        } finally {
          setLoadingFavorites(false);
        }
      }
    };

    fetchFavoriteProperties();
  }, [activeTab, session?.accessToken, status]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-gray-600">
              Here's an overview of your mortgage journey
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Applications</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loanApplicationsLoading ? '...' : loanApplications.filter((app: any) => app.status !== 'Rejected').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <Heart className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Saved Properties</p>
                    <p className="text-2xl font-bold text-gray-900">{favoriteProperties.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <Calculator className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Calculations</p>
                    <p className="text-2xl font-bold text-gray-900">{history.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <TrendingUp className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Credit Score</p>
                    <p className="text-2xl font-bold text-gray-900">-</p>
                    <p className="text-xs text-gray-500">Check credit score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'applications', label: 'Loan Applications', icon: FileText },
              { id: 'properties', label: 'Saved Properties', icon: Heart },
              { id: 'calculations', label: 'Calculations', icon: Calculator }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Show real recent activities based on loan applications */}
                      {loanApplications.slice(0, 3).map((application: any, index: number) => (
                        <div key={application.id} className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">Loan Application {application.status}</p>
                            <p className="text-sm text-gray-600">
                              Application #{application.id} - {formatCurrency(application.loanAmount)}
                            </p>
                            <p className="text-xs text-gray-500">{formatDate(application.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                      
                      {/* Show recent favorite properties */}
                      {favoriteProperties.slice(0, 2).map((property, index) => (
                        <div key={property.id} className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
                          <div className="p-2 bg-purple-100 rounded-full">
                            <Heart className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">Property Saved</p>
                            <p className="text-sm text-gray-600">{property.address}, {property.city}, {property.state}</p>
                            <p className="text-xs text-gray-500">{formatDate(property.listedDate)}</p>
                          </div>
                        </div>
                      ))}

                      {/* If no activities, show empty state */}
                      {loanApplications.length === 0 && favoriteProperties.length === 0 && (
                        <div className="text-center py-8">
                          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">No recent activity</p>
                          <p className="text-sm text-gray-500">Start by submitting a loan application or saving properties</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link href="/loan-application" className="block">
                      <Button className="w-full justify-start" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Start New Application
                      </Button>
                    </Link>
                    
                    <Link href="/mortgage-tools" className="block">
                      <Button className="w-full justify-start" variant="outline">
                        <Calculator className="h-4 w-4 mr-2" />
                        Calculate Payment
                      </Button>
                    </Link>
                    
                    <Link href="/search" className="block">
                      <Button className="w-full justify-start" variant="outline">
                        <Heart className="h-4 w-4 mr-2" />
                        Search Properties
                      </Button>
                    </Link>
                    
                    <Button className="w-full justify-start" variant="outline">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Check Credit Score
                    </Button>
                  </CardContent>
                </Card>

                {/* Profile Summary */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Profile Summary
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{user?.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{user?.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Member Since</p>
                      <p className="font-medium">{user?.createdAt ? formatDate(user.createdAt) : 'Not available'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="space-y-6">
              {loanApplicationsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading applications...</p>
                </div>
              ) : loanApplications.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No loan applications</h3>
                  <p className="text-gray-600 mb-4">
                    You haven't submitted any loan applications yet.
                  </p>
                  <Link href="/loan-application">
                    <Button>Start Application</Button>
                  </Link>
                </div>
              ) : (
                loanApplications.map((application: any) => (
                  <Card key={application.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Application #{application.id}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                              {application.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">Loan Amount</p>
                              <p className="font-semibold text-lg">{formatCurrency(application.loanAmount)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Property Value</p>
                              <p className="font-medium">{formatCurrency(application.propertyValue)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Submitted</p>
                              <p className="font-medium">{formatDate(application.createdAt)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Status</p>
                              <p className="font-medium">{application.status}</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Application Progress</span>
                              <span className="font-medium">{calculateProgress(application.status, application.createdAt)}%</span>
                            </div>
                            <Progress value={calculateProgress(application.status, application.createdAt)} />
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'properties' && (
            <div>
              {loadingFavorites ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading saved properties...</p>
                </div>
              ) : favoriteProperties.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved properties</h3>
                  <p className="text-gray-600 mb-4">
                    Start browsing properties and save your favorites to see them here.
                  </p>
                  <Link href="/search">
                    <Button>Browse Properties</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteProperties.map((property) => (
                    <Card key={property.id} className="overflow-hidden">
                      <div className="h-48 bg-gray-200 relative">
                        <PropertyImage
                          src={property.imageUrl}
                          alt={`${property.address}, ${property.city}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-4 left-4 text-white">
                          <p className="text-lg font-bold">{formatCurrency(property.price)}</p>
                        </div>
                      </div>
                      <CardContent className="pt-4">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {property.address}, {property.city}, {property.state}
                        </h3>
                        <div className="flex justify-between text-sm text-gray-600 mb-3">
                          <span>{property.bedrooms} bed</span>
                          <span>{property.bathrooms} bath</span>
                          <span>{property.squareFeet.toLocaleString()} sqft</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                          Listed on {formatDate(property.listedDate)}
                        </p>
                    <div className="flex gap-2">
                      <Link href={`/properties/${property.id}`}>
                        <Button variant="outline" size="sm" className="flex-1">
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/mortgage-tools?propertyPrice=${property.price}`}>
                        <Button variant="outline" size="sm">
                          <Calculator className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'calculations' && (
            <div>
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No calculations history</h3>
                  <p className="text-gray-600 mb-4">
                    You haven't saved any mortgage calculations yet. Use our calculator and save your results.
                  </p>
                  <Link href="/mortgage-tools">
                    <Button>Mortgage Calculator</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Saved Calculations</h2>
                    <Link href="/mortgage-tools">
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        New Calculation
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {history.map((calculation) => (
                      <Card key={calculation.id} className="overflow-hidden">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {calculation.name || `Calculation ${calculation.id.slice(-4)}`}
                            </h3>
                            <div className="text-xs text-gray-500">
                              {formatDate(calculation.date)}
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Loan Amount:</span>
                              <span className="font-medium">{formatCurrency(calculation.params.loanAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Interest Rate:</span>
                              <span className="font-medium">{calculation.params.interestRate}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Monthly Payment:</span>
                              <span className="font-medium text-blue-600">
                                {formatCurrency(calculation.result.monthlyPayment)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <Link href={`/mortgage-tools?calculation=${calculation.id}`}>
                              <Button variant="outline" size="sm" className="w-full">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}