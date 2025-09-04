'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercent } from '@/lib/utils/mortgage-utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Home,
  Calendar,
  DollarSign,
  BarChart3,
  AlertCircle
} from 'lucide-react';

interface MarketIndicatorsData {
  medianHomePrice: number;
  priceChange: number;
  averageRate: number;
  rateChange: number;
  inventory: number;
  inventoryChange: number;
  daysOnMarket: number;
  domChange: number;
}

interface MarketIndicatorsProps {
  data: MarketIndicatorsData;
}

export function MarketIndicators({ data }: MarketIndicatorsProps) {
  const getMarketHealthScore = () => {
    // Simple scoring algorithm based on key metrics
    let score = 50; // Base score
    
    // Price appreciation (moderate is good)
    if (data.priceChange >= 3 && data.priceChange <= 7) score += 15;
    else if (data.priceChange < 3) score += 5;
    else score -= 10; // Too high appreciation is concerning
    
    // Days on market (lower is better for sellers)
    if (data.daysOnMarket < 30) score += 15;
    else if (data.daysOnMarket < 45) score += 10;
    else score -= 5;
    
    // Inventory levels (balanced is 6 months)
    if (data.inventory >= 4 && data.inventory <= 6) score += 15;
    else if (data.inventory < 4) score += 5; // Tight inventory
    else score -= 10; // Too much inventory
    
    // Interest rate trend (lower rates are better)
    if (data.rateChange < 0) score += 10; // Rates going down
    else if (data.rateChange > 0.2) score -= 10; // Rates rising quickly
    
    return Math.max(0, Math.min(100, score));
  };

  const marketScore = getMarketHealthScore();

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return 'bg-green-100';
    if (score >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const indicators = [
    {
      label: 'Market Activity',
      value: data.daysOnMarket,
      unit: 'days',
      change: data.domChange,
      changeUnit: 'vs last month',
      icon: Activity,
      description: 'Average days properties stay on market',
      interpretation: data.daysOnMarket < 30 ? 'Very Active' : 
                     data.daysOnMarket < 45 ? 'Active' : 'Slow'
    },
    {
      label: 'Supply Level',
      value: data.inventory,
      unit: 'months',
      change: data.inventoryChange,
      changeUnit: '% YoY',
      icon: BarChart3,
      description: 'Months of inventory at current sales pace',
      interpretation: data.inventory < 4 ? 'Low Supply' :
                     data.inventory < 6 ? 'Balanced' : 'High Supply'
    },
    {
      label: 'Affordability Impact',
      value: data.averageRate * 1000, // Display as basis points for calculation
      displayValue: formatPercent(data.averageRate),
      unit: '',
      change: data.rateChange,
      changeUnit: '% vs last month',
      icon: DollarSign,
      description: 'Current mortgage rates affecting affordability',
      interpretation: data.averageRate < 6 ? 'Favorable' :
                     data.averageRate < 7 ? 'Moderate' : 'High'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Market Health Indicators
        </CardTitle>
        <p className="text-sm text-gray-600">
          Key metrics showing current market conditions
        </p>
      </CardHeader>
      <CardContent>
        {/* Overall Market Score */}
        <div className={`p-4 rounded-lg mb-6 ${getScoreBg(marketScore)}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Market Health Score</h3>
              <p className="text-sm text-gray-600">
                Composite score based on key market indicators
              </p>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold ${getScoreColor(marketScore)}`}>
                {marketScore}
              </p>
              <p className="text-sm text-gray-600">out of 100</p>
            </div>
          </div>
          
          {/* Score interpretation */}
          <div className="mt-3 text-sm">
            <p className={`font-medium ${getScoreColor(marketScore)}`}>
              {marketScore >= 75 ? '🟢 Healthy Market' :
               marketScore >= 50 ? '🟡 Balanced Market' :
               '🔴 Challenging Market'}
            </p>
          </div>
        </div>

        {/* Individual Indicators */}
        <div className="space-y-4">
          {indicators.map((indicator, index) => {
            const Icon = indicator.icon;
            const isPositiveChange = indicator.label === 'Supply Level' ? 
              indicator.change > 0 : indicator.change < 0;
            
            return (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{indicator.label}</h4>
                      <p className="text-xs text-gray-600 mt-1">{indicator.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          indicator.interpretation === 'Very Active' || 
                          indicator.interpretation === 'Favorable' || 
                          indicator.interpretation === 'Low Supply' ? 'bg-green-100 text-green-800' :
                          indicator.interpretation === 'Active' ||
                          indicator.interpretation === 'Balanced' ||
                          indicator.interpretation === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {indicator.interpretation}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      {indicator.displayValue || `${indicator.value}${indicator.unit}`}
                    </p>
                    <div className={`flex items-center gap-1 text-sm mt-1 ${
                      isPositiveChange ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isPositiveChange ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span>
                        {Math.abs(indicator.change).toFixed(indicator.changeUnit.includes('%') ? 1 : 0)}
                        {indicator.changeUnit.includes('%') ? '%' : ''} {indicator.changeUnit}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Market Insights */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <h4 className="font-semibold text-gray-900">Market Insights</h4>
          </div>
          
          <div className="space-y-2 text-sm text-gray-700">
            {data.priceChange > 5 && (
              <p>• Strong price appreciation may be pricing out some buyers</p>
            )}
            {data.daysOnMarket < 30 && (
              <p>• Fast-moving market favors sellers with multiple offers common</p>
            )}
            {data.inventory < 4 && (
              <p>• Limited inventory creating competitive buyer environment</p>
            )}
            {data.rateChange > 0.1 && (
              <p>• Rising interest rates may cool buyer demand in coming months</p>
            )}
            {marketScore >= 75 && (
              <p>• Overall market conditions are favorable for transactions</p>
            )}
            {marketScore < 50 && (
              <p>• Market challenges may create opportunities for prepared buyers</p>
            )}
          </div>
        </div>

        {/* Buyer vs Seller Market Indicator */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className={`p-3 rounded-lg ${
            data.daysOnMarket < 35 && data.inventory < 5 ? 'bg-red-50' : 'bg-gray-50'
          }`}>
            <h4 className={`font-semibold mb-1 ${
              data.daysOnMarket < 35 && data.inventory < 5 ? 'text-red-900' : 'text-gray-900'
            }`}>
              Seller's Market Index
            </h4>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  data.daysOnMarket < 35 && data.inventory < 5 ? 'bg-red-500' : 'bg-gray-400'
                }`}
                style={{ 
                  width: `${Math.min(100, Math.max(0, 100 - (data.daysOnMarket * 2) - (data.inventory * 10)))}%` 
                }}
              ></div>
            </div>
          </div>
          
          <div className={`p-3 rounded-lg ${
            data.daysOnMarket > 45 && data.inventory > 6 ? 'bg-green-50' : 'bg-gray-50'
          }`}>
            <h4 className={`font-semibold mb-1 ${
              data.daysOnMarket > 45 && data.inventory > 6 ? 'text-green-900' : 'text-gray-900'
            }`}>
              Buyer's Market Index
            </h4>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  data.daysOnMarket > 45 && data.inventory > 6 ? 'bg-green-500' : 'bg-gray-400'
                }`}
                style={{ 
                  width: `${Math.min(100, Math.max(0, (data.daysOnMarket * 1.5) + (data.inventory * 8) - 50))}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}