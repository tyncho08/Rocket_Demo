'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Navbar } from '@/components/layouts/navbar';
import Link from 'next/link';
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

// Mock data - in a real app, this would come from APIs
const mockLoanApplications = [
  {
    id: 1,
    applicationNumber: 'LA-2024-001',
    loanAmount: 350000,
    propertyAddress: '123 Main St, Austin, TX 78701',
    status: 'Under Review',
    statusColor: 'bg-yellow-100 text-yellow-800',
    submittedDate: '2024-01-15',
    estimatedDecision: '2024-01-25',
    progress: 65
  },
  {
    id: 2,
    applicationNumber: 'LA-2024-002',
    loanAmount: 280000,
    propertyAddress: '456 Oak Ave, Dallas, TX 75201',
    status: 'Approved',
    statusColor: 'bg-green-100 text-green-800',
    submittedDate: '2024-01-10',
    estimatedDecision: '2024-01-20',
    progress: 100
  }
];

const mockFavoriteProperties = [
  {
    id: 1,
    address: '789 Pine St, Houston, TX 77001',
    price: 425000,
    bedrooms: 3,
    bathrooms: 2.5,
    squareFeet: 2100,
    imageUrl: '/api/placeholder/400/300',
    listingDate: '2024-01-10'
  },
  {
    id: 2,
    address: '321 Elm Dr, San Antonio, TX 78201',
    price: 315000,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1800,
    imageUrl: '/api/placeholder/400/300',
    listingDate: '2024-01-12'
  },
  {
    id: 3,
    address: '654 Maple Ln, Fort Worth, TX 76101',
    price: 385000,
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 2400,
    imageUrl: '/api/placeholder/400/300',
    listingDate: '2024-01-14'
  }
];

const mockCalculationHistory = [
  {
    id: '1',
    name: '$350K at 6.5%',
    loanAmount: 350000,
    interestRate: 6.5,
    monthlyPayment: 2212,
    date: '2024-01-15'
  },
  {
    id: '2',
    name: '$280K at 6.25%',
    loanAmount: 280000,
    interestRate: 6.25,
    monthlyPayment: 1724,
    date: '2024-01-12'
  },
  {
    id: '3',
    name: '$425K at 6.75%',
    loanAmount: 425000,
    interestRate: 6.75,
    monthlyPayment: 2758,
    date: '2024-01-10'
  }
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'properties' | 'calculations'>('overview');

  const user = session?.user;

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
                      {mockLoanApplications.filter(app => app.status !== 'Denied').length}
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
                    <p className="text-2xl font-bold text-gray-900">{mockFavoriteProperties.length}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{mockCalculationHistory.length}</p>
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
                    <p className="text-2xl font-bold text-gray-900">742</p>
                    <p className="text-xs text-green-600">Excellent</p>
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
                      <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Loan Application Submitted</p>
                          <p className="text-sm text-gray-600">Application LA-2024-001 submitted for review</p>
                          <p className="text-xs text-gray-500">January 15, 2024</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                        <div className="p-2 bg-green-100 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Application Approved</p>
                          <p className="text-sm text-gray-600">Congratulations! Application LA-2024-002 has been approved</p>
                          <p className="text-xs text-gray-500">January 20, 2024</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Heart className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Property Saved</p>
                          <p className="text-sm text-gray-600">789 Pine St, Houston, TX added to favorites</p>
                          <p className="text-xs text-gray-500">January 10, 2024</p>
                        </div>
                      </div>
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
                      <p className="font-medium">January 2024</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="space-y-6">
              {mockLoanApplications.map((application) => (
                <Card key={application.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Application #{application.applicationNumber}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${application.statusColor}`}>
                            {application.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Loan Amount</p>
                            <p className="font-semibold text-lg">{formatCurrency(application.loanAmount)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Property Address</p>
                            <p className="font-medium">{application.propertyAddress}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Submitted</p>
                            <p className="font-medium">{formatDate(application.submittedDate)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Est. Decision</p>
                            <p className="font-medium">{formatDate(application.estimatedDecision)}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Application Progress</span>
                            <span className="font-medium">{application.progress}%</span>
                          </div>
                          <Progress value={application.progress} />
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
              ))}
            </div>
          )}

          {activeTab === 'properties' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockFavoriteProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <div className="h-48 bg-gray-200 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-lg font-bold">{formatCurrency(property.price)}</p>
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{property.address}</h3>
                    <div className="flex justify-between text-sm text-gray-600 mb-3">
                      <span>{property.bedrooms} bed</span>
                      <span>{property.bathrooms} bath</span>
                      <span>{property.squareFeet.toLocaleString()} sqft</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      Listed on {formatDate(property.listingDate)}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calculator className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'calculations' && (
            <div className="space-y-4">
              {mockCalculationHistory.map((calculation) => (
                <Card key={calculation.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{calculation.name}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Loan Amount</p>
                            <p className="font-medium">{formatCurrency(calculation.loanAmount)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Interest Rate</p>
                            <p className="font-medium">{calculation.interestRate}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Monthly Payment</p>
                            <p className="font-medium">{formatCurrency(calculation.monthlyPayment)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Calculated</p>
                            <p className="font-medium">{formatDate(calculation.date)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          Load
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}