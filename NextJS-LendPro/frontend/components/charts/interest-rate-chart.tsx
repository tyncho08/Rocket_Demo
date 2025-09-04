'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RateData {
  month: string;
  rate: number;
  price: number;
}

interface InterestRateChartProps {
  data: RateData[];
}

export function InterestRateChart({ data }: InterestRateChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const rate = payload[0].value;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p style={{ color: payload[0].color }}>
            Mortgage Rate: {rate.toFixed(3)}%
          </p>
          <div className="mt-2 text-xs text-gray-600">
            <p>30-Year Fixed Rate Mortgage</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const minRate = Math.min(...data.map(d => d.rate));
  const maxRate = Math.max(...data.map(d => d.rate));
  const rateRange = maxRate - minRate;
  const yAxisMin = Math.max(0, minRate - rateRange * 0.1);
  const yAxisMax = maxRate + rateRange * 0.1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interest Rate Trends</CardTitle>
        <p className="text-sm text-gray-600">
          30-Year Fixed Mortgage Rates - Historical Performance
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis 
                domain={[yAxisMin, yAxisMax]}
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
                tickFormatter={(value) => `${value.toFixed(2)}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#rateGradient)"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-600 font-medium">Current Rate</p>
            <p className="text-lg font-bold text-blue-700">
              {(data[data.length - 1]?.rate || 0).toFixed(3)}%
            </p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-green-600 font-medium">Period Low</p>
            <p className="text-lg font-bold text-green-700">
              {minRate.toFixed(3)}%
            </p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-red-600 font-medium">Period High</p>
            <p className="text-lg font-bold text-red-700">
              {maxRate.toFixed(3)}%
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Rate Impact Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700 mb-1">Payment Impact on $400K Loan:</p>
              <div className="space-y-1">
                <p className="text-gray-600">
                  At {minRate.toFixed(2)}%: ${((400000 * (minRate/100/12) * Math.pow(1 + minRate/100/12, 360)) / (Math.pow(1 + minRate/100/12, 360) - 1)).toFixed(0)}/month
                </p>
                <p className="text-gray-600">
                  At {maxRate.toFixed(2)}%: ${((400000 * (maxRate/100/12) * Math.pow(1 + maxRate/100/12, 360)) / (Math.pow(1 + maxRate/100/12, 360) - 1)).toFixed(0)}/month
                </p>
              </div>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-1">Market Factors:</p>
              <div className="space-y-1 text-gray-600">
                <p>• Federal Reserve policy decisions</p>
                <p>• Economic indicators & inflation</p>
                <p>• Bond market performance</p>
                <p>• Lender competition & capacity</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}