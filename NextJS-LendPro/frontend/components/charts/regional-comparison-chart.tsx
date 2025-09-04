'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercent } from '@/lib/utils/mortgage-utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface RegionalData {
  city: string;
  medianPrice: number;
  priceChange: number;
  inventory: number;
  daysOnMarket: number;
  hotScore: number;
}

interface RegionalComparisonChartProps {
  data: RegionalData[];
}

export function RegionalComparisonChart({ data }: RegionalComparisonChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const cityData = data.find(d => d.city === label);
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-blue-600">
              Median Price: {formatCurrency(payload[0].value)}
            </p>
            {cityData && (
              <>
                <p className={`flex items-center gap-1 ${
                  cityData.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {cityData.priceChange >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  Price Change: {cityData.priceChange >= 0 ? '+' : ''}{cityData.priceChange}%
                </p>
                <p className="text-gray-600">
                  Inventory: {cityData.inventory} months
                </p>
                <p className="text-gray-600">
                  Days on Market: {cityData.daysOnMarket}
                </p>
                <p className={`font-medium ${
                  cityData.hotScore >= 80 ? 'text-red-600' :
                  cityData.hotScore >= 70 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  Market Score: {cityData.hotScore}/100
                </p>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Define colors based on market hotness
  const getBarColor = (hotScore: number) => {
    if (hotScore >= 80) return '#EF4444'; // Red for hot market
    if (hotScore >= 70) return '#F59E0B'; // Yellow for balanced
    return '#10B981'; // Green for buyer's market
  };

  const chartData = data.map(item => ({
    ...item,
    displayCity: item.city.split(',')[0] // Show just city name without state
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regional Market Comparison</CardTitle>
        <p className="text-sm text-gray-600">
          Median home prices across major Texas markets
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="displayCity"
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="medianPrice" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getBarColor(entry.hotScore)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Market Legend */}
        <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-600">Hot Market (80+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-gray-600">Balanced Market (70-79)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-600">Buyer's Market (&lt;70)</span>
          </div>
        </div>

        {/* Regional Insights */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Market Leaders</h4>
            <div className="space-y-1">
              {data
                .sort((a, b) => b.medianPrice - a.medianPrice)
                .slice(0, 2)
                .map((city, index) => (
                  <p key={index} className="text-blue-800">
                    {index + 1}. {city.city} - {formatCurrency(city.medianPrice)}
                  </p>
                ))}
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">Price Growth Leaders</h4>
            <div className="space-y-1">
              {data
                .sort((a, b) => b.priceChange - a.priceChange)
                .slice(0, 2)
                .map((city, index) => (
                  <p key={index} className="text-green-800">
                    {index + 1}. {city.city} - +{city.priceChange}%
                  </p>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}