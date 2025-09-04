'use client';

import { useState, useMemo } from 'react';
import { Navbar } from '@/components/layouts/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MarketOverviewChart } from '@/components/charts/market-overview-chart';
import { InterestRateChart } from '@/components/charts/interest-rate-chart';
import { RegionalComparisonChart } from '@/components/charts/regional-comparison-chart';
import { MarketIndicators } from '@/components/market/market-indicators';
import { formatCurrency, formatPercent } from '@/lib/utils/mortgage-utils';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart,
  Download,
  Calendar,
  MapPin,
  DollarSign,
  Percent
} from 'lucide-react';

// Mock market data
const mockMarketData = {
  national: {
    medianHomePrice: 425000,
    priceChange: 5.2,
    averageRate: 6.85,
    rateChange: -0.15,
    inventory: 4.2,
    inventoryChange: 12.3,
    daysOnMarket: 28,
    domChange: -5
  },
  regional: [
    {
      city: 'Austin, TX',
      medianPrice: 485000,
      priceChange: 6.8,
      inventory: 3.8,
      daysOnMarket: 25,
      hotScore: 85
    },
    {
      city: 'Dallas, TX',
      medianPrice: 375000,
      priceChange: 4.2,
      inventory: 4.5,
      daysOnMarket: 32,
      hotScore: 72
    },
    {
      city: 'Houston, TX',
      medianPrice: 340000,
      priceChange: 3.8,
      inventory: 4.8,
      daysOnMarket: 30,
      hotScore: 68
    },
    {
      city: 'San Antonio, TX',
      medianPrice: 295000,
      priceChange: 5.5,
      inventory: 5.2,
      daysOnMarket: 35,
      hotScore: 65
    }
  ],
  priceHistory: [
    { month: 'Jan 2024', price: 405000, rate: 7.2 },
    { month: 'Feb 2024', price: 408000, rate: 7.0 },
    { month: 'Mar 2024', price: 412000, rate: 6.95 },
    { month: 'Apr 2024', price: 415000, rate: 6.9 },
    { month: 'May 2024', price: 418000, rate: 6.88 },
    { month: 'Jun 2024', price: 420000, rate: 6.85 },
    { month: 'Jul 2024', price: 422000, rate: 6.82 },
    { month: 'Aug 2024', price: 425000, rate: 6.85 }
  ],
  forecast: [
    { period: 'Q4 2024', priceChange: 4.8, rateRange: '6.5-7.0' },
    { period: 'Q1 2025', priceChange: 3.2, rateRange: '6.2-6.8' },
    { period: 'Q2 2025', priceChange: 2.8, rateRange: '6.0-6.6' },
    { period: 'Q3 2025', priceChange: 3.5, rateRange: '5.8-6.4' }
  ]
};

const timeframeOptions = [
  { value: '6m', label: 'Last 6 Months' },
  { value: '1y', label: 'Last Year' },
  { value: '2y', label: 'Last 2 Years' },
  { value: '5y', label: 'Last 5 Years' }
];

const regionOptions = [
  { value: 'national', label: 'National' },
  { value: 'texas', label: 'Texas' },
  { value: 'austin', label: 'Austin Metro' },
  { value: 'dallas', label: 'Dallas Metro' },
  { value: 'houston', label: 'Houston Metro' },
  { value: 'san-antonio', label: 'San Antonio Metro' }
];

export default function MarketTrendsPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1y');
  const [selectedRegion, setSelectedRegion] = useState('national');
  const [activeTab, setActiveTab] = useState<'overview' | 'rates' | 'regional' | 'forecast'>('overview');

  const { national, regional, priceHistory, forecast } = mockMarketData;

  const exportReport = () => {
    // Mock export functionality
    const reportData = {
      generatedAt: new Date().toISOString(),
      region: selectedRegion,
      timeframe: selectedTimeframe,
      marketData: {
        medianHomePrice: national.medianHomePrice,
        priceChange: national.priceChange,
        averageRate: national.averageRate,
        inventory: national.inventory
      }
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `market-report-${selectedRegion}-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Market Trends & Analytics
                </h1>
                <p className="text-gray-600">
                  Real-time housing market data and insights
                </p>
              </div>
              
              <div className="flex gap-4 mt-4 md:mt-0">
                <Select
                  value={selectedRegion}
                  options={regionOptions}
                  onChange={setSelectedRegion}
                />
                <Select
                  value={selectedTimeframe}
                  options={timeframeOptions}
                  onChange={setSelectedTimeframe}
                />
                <Button variant="outline" onClick={exportReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Median Home Price</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(national.medianHomePrice)}
                    </p>
                    <div className={`flex items-center mt-1 ${
                      national.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {national.priceChange >= 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      <span className="text-sm font-medium">
                        {formatPercent(Math.abs(national.priceChange))} YoY
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Mortgage Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPercent(national.averageRate)}
                    </p>
                    <div className={`flex items-center mt-1 ${
                      national.rateChange <= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {national.rateChange <= 0 ? (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      )}
                      <span className="text-sm font-medium">
                        {Math.abs(national.rateChange).toFixed(2)}% vs last month
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Percent className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Inventory (Months)</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {national.inventory}
                    </p>
                    <div className={`flex items-center mt-1 ${
                      national.inventoryChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {national.inventoryChange >= 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      <span className="text-sm font-medium">
                        {formatPercent(Math.abs(national.inventoryChange))} YoY
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Days on Market</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {national.daysOnMarket}
                    </p>
                    <div className={`flex items-center mt-1 ${
                      national.domChange <= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {national.domChange <= 0 ? (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      )}
                      <span className="text-sm font-medium">
                        {Math.abs(national.domChange)} days vs last month
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Calendar className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Market Overview', icon: BarChart3 },
              { id: 'rates', label: 'Interest Rates', icon: TrendingUp },
              { id: 'regional', label: 'Regional Analysis', icon: MapPin },
              { id: 'forecast', label: 'Market Forecast', icon: PieChart }
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MarketOverviewChart data={priceHistory} />
              <MarketIndicators data={national} />
            </div>
          )}

          {activeTab === 'rates' && (
            <div className="space-y-6">
              <InterestRateChart data={priceHistory} />
              
              <Card>
                <CardHeader>
                  <CardTitle>Rate Analysis & Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Current Trends</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Rates have stabilized after recent volatility</li>
                        <li>• Federal Reserve signals potential cuts in 2025</li>
                        <li>• 30-year fixed rates remain competitive historically</li>
                        <li>• ARM products gaining popularity among buyers</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Rate Impact</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-900">At 6.5% Rate</p>
                          <p className="text-xs text-blue-700">$300K loan = $1,896/month</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-green-900">At 6.0% Rate</p>
                          <p className="text-xs text-green-700">$300K loan = $1,799/month</p>
                          <p className="text-xs text-green-600 font-medium">Save $97/month</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'regional' && (
            <div className="space-y-6">
              <RegionalComparisonChart data={regional} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {regional.map((city, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 mb-1">{city.city}</h3>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            city.hotScore >= 80 ? 'bg-red-500' :
                            city.hotScore >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <span className="text-sm text-gray-600">
                            {city.hotScore >= 80 ? 'Hot Market' :
                             city.hotScore >= 70 ? 'Balanced' : 'Buyer\'s Market'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Median Price</span>
                          <span className="font-medium">{formatCurrency(city.medianPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price Change</span>
                          <span className={`font-medium ${
                            city.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {city.priceChange >= 0 ? '+' : ''}{city.priceChange}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Inventory</span>
                          <span className="font-medium">{city.inventory} mo</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Days on Market</span>
                          <span className="font-medium">{city.daysOnMarket} days</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'forecast' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Market Forecast - Next 12 Months</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {forecast.map((period, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-gray-900">{period.period}</h4>
                          <p className="text-sm text-gray-600">Quarterly forecast</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {period.priceChange >= 0 ? '+' : ''}{period.priceChange}% Price Change
                          </p>
                          <p className="text-sm text-gray-600">
                            Rate Range: {period.rateRange}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Market Outlook Summary</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Home prices expected to moderate but continue growing</li>
                      <li>• Interest rates may decline slightly in 2025</li>
                      <li>• Inventory levels should improve gradually</li>
                      <li>• Regional variations will persist across markets</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}