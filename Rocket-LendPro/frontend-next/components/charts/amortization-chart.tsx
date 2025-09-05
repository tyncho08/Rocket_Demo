'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AmortizationData {
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

interface AmortizationChartProps {
  schedule: AmortizationData[];
  showYears?: boolean;
}

export function AmortizationChart({ schedule, showYears = false }: AmortizationChartProps) {
  // Return early if no data
  if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Payment Breakdown</h3>
        <p className="text-gray-500">No data available for chart</p>
      </div>
    );
  }

  // Group by year if showing years, otherwise show monthly  
  const chartData = showYears 
    ? groupByYear(schedule)
    : schedule.slice(0, 60).map((payment, index) => ({  // Show first 5 years monthly
        period: `Month ${index + 1}`,
        principal: Math.round(payment.principal),
        interest: Math.round(payment.interest),
        balance: Math.round(payment.balance)
      }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-4 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">
        {showYears ? 'Annual' : 'Monthly'} Principal vs Interest
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="principal" 
              fill="#3B82F6" 
              name="Principal"
              radius={[0, 0, 4, 4]}
            />
            <Bar 
              dataKey="interest" 
              fill="#EF4444" 
              name="Interest"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function groupByYear(schedule: AmortizationData[]) {
  if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
    return [];
  }
  
  const yearlyData: { [key: number]: { principal: number; interest: number; balance: number } } = {};
  
  schedule.forEach((payment) => {
    const year = Math.ceil(payment.payment / 12);
    if (!yearlyData[year]) {
      yearlyData[year] = { principal: 0, interest: 0, balance: 0 };
    }
    yearlyData[year].principal += payment.principal;
    yearlyData[year].interest += payment.interest;
    yearlyData[year].balance = payment.balance; // Take the last balance of the year
  });

  return Object.keys(yearlyData).map(year => ({
    period: `Year ${year}`,
    principal: Math.round(yearlyData[Number(year)].principal),
    interest: Math.round(yearlyData[Number(year)].interest),
    balance: Math.round(yearlyData[Number(year)].balance)
  }));
}