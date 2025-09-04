'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/mortgage-utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Home, Building, DollarSign, TrendingUp, Calculator } from 'lucide-react';

interface RentVsBuyInputs {
  homePrice: number;
  downPayment: number;
  interestRate: number;
  loanTermYears: number;
  monthlyRent: number;
  rentIncrease: number;
  homeAppreciation: number;
  propertyTax: number;
  homeInsurance: number;
  maintenance: number;
  closingCosts: number;
  yearsToAnalyze: number;
}

export function RentVsBuyCalculator() {
  const [inputs, setInputs] = useState<RentVsBuyInputs>({
    homePrice: 400000,
    downPayment: 80000,
    interestRate: 6.8,
    loanTermYears: 30,
    monthlyRent: 2500,
    rentIncrease: 3,
    homeAppreciation: 3.5,
    propertyTax: 4800,
    homeInsurance: 1200,
    maintenance: 6000,
    closingCosts: 8000,
    yearsToAnalyze: 10
  });

  const calculateMonthlyPayment = (principal: number, rate: number, years: number) => {
    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = years * 12;
    
    if (monthlyRate === 0) return principal / numberOfPayments;
    
    return (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) / 
           (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  };

  const calculations = useMemo(() => {
    const loanAmount = inputs.homePrice - inputs.downPayment;
    const monthlyPayment = calculateMonthlyPayment(loanAmount, inputs.interestRate, inputs.loanTermYears);
    const monthlyTaxes = inputs.propertyTax / 12;
    const monthlyInsurance = inputs.homeInsurance / 12;
    const monthlyMaintenance = inputs.maintenance / 12;
    const totalMonthlyBuying = monthlyPayment + monthlyTaxes + monthlyInsurance + monthlyMaintenance;

    // Year-by-year analysis
    const yearlyAnalysis = [];
    let cumulativeRentCost = 0;
    let cumulativeBuyCost = inputs.downPayment + inputs.closingCosts;
    let currentRent = inputs.monthlyRent;
    let homeValue = inputs.homePrice;
    let remainingBalance = loanAmount;

    for (let year = 1; year <= inputs.yearsToAnalyze; year++) {
      // Rent calculations
      const yearlyRent = currentRent * 12;
      cumulativeRentCost += yearlyRent;

      // Buy calculations
      const yearlyMortgage = monthlyPayment * 12;
      const yearlyTaxes = inputs.propertyTax;
      const yearlyInsurance = inputs.homeInsurance;
      const yearlyMaintenance = inputs.maintenance;
      const yearlyBuyCost = yearlyMortgage + yearlyTaxes + yearlyInsurance + yearlyMaintenance;
      cumulativeBuyCost += yearlyBuyCost;

      // Calculate principal paid down (simplified)
      const principalPaidThisYear = yearlyMortgage - (remainingBalance * inputs.interestRate / 100);
      remainingBalance = Math.max(0, remainingBalance - principalPaidThisYear);

      // Home value appreciation
      homeValue *= (1 + inputs.homeAppreciation / 100);

      // Net position for buying (home equity minus remaining costs)
      const homeEquity = homeValue - remainingBalance;
      const netBuyPosition = homeEquity - cumulativeBuyCost;

      yearlyAnalysis.push({
        year,
        cumulativeRentCost,
        cumulativeBuyCost,
        homeValue,
        homeEquity,
        netBuyPosition,
        netRentPosition: -cumulativeRentCost,
        breakEven: netBuyPosition > -cumulativeRentCost
      });

      // Update rent for next year
      currentRent *= (1 + inputs.rentIncrease / 100);
    }

    // Find break-even year
    const breakEvenYear = yearlyAnalysis.find(year => year.breakEven)?.year || null;

    return {
      loanAmount,
      monthlyPayment,
      totalMonthlyBuying,
      monthlyTaxes,
      monthlyInsurance,
      monthlyMaintenance,
      yearlyAnalysis,
      breakEvenYear,
      finalHomeValue: homeValue,
      finalRentCost: cumulativeRentCost,
      finalBuyNetPosition: yearlyAnalysis[yearlyAnalysis.length - 1]?.netBuyPosition || 0
    };
  }, [inputs]);

  const updateInput = (field: keyof RentVsBuyInputs, value: string) => {
    setInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const chartData = calculations.yearlyAnalysis.map(year => ({
    year: year.year,
    Renting: -year.cumulativeRentCost,
    Buying: year.netBuyPosition
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Rent vs Buy Calculator
          </CardTitle>
          <p className="text-sm text-gray-600">
            Compare the financial impact of renting versus buying over time
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Input Form */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Home Price
                    </label>
                    <Input
                      type="number"
                      value={inputs.homePrice}
                      onChange={(e) => updateInput('homePrice', e.target.value)}
                      placeholder="400000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Down Payment
                    </label>
                    <Input
                      type="number"
                      value={inputs.downPayment}
                      onChange={(e) => updateInput('downPayment', e.target.value)}
                      placeholder="80000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interest Rate (%)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={inputs.interestRate}
                      onChange={(e) => updateInput('interestRate', e.target.value)}
                      placeholder="6.8"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loan Term (Years)
                    </label>
                    <Input
                      type="number"
                      value={inputs.loanTermYears}
                      onChange={(e) => updateInput('loanTermYears', e.target.value)}
                      placeholder="30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Closing Costs
                    </label>
                    <Input
                      type="number"
                      value={inputs.closingCosts}
                      onChange={(e) => updateInput('closingCosts', e.target.value)}
                      placeholder="8000"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Rent
                    </label>
                    <Input
                      type="number"
                      value={inputs.monthlyRent}
                      onChange={(e) => updateInput('monthlyRent', e.target.value)}
                      placeholder="2500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Rent Increase (%)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={inputs.rentIncrease}
                      onChange={(e) => updateInput('rentIncrease', e.target.value)}
                      placeholder="3"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Homeownership Costs</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Property Tax
                    </label>
                    <Input
                      type="number"
                      value={inputs.propertyTax}
                      onChange={(e) => updateInput('propertyTax', e.target.value)}
                      placeholder="4800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Home Insurance
                    </label>
                    <Input
                      type="number"
                      value={inputs.homeInsurance}
                      onChange={(e) => updateInput('homeInsurance', e.target.value)}
                      placeholder="1200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Maintenance
                    </label>
                    <Input
                      type="number"
                      value={inputs.maintenance}
                      onChange={(e) => updateInput('maintenance', e.target.value)}
                      placeholder="6000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Home Appreciation (%)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={inputs.homeAppreciation}
                      onChange={(e) => updateInput('homeAppreciation', e.target.value)}
                      placeholder="3.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Analysis Period (Years)
                    </label>
                    <Input
                      type="number"
                      value={inputs.yearsToAnalyze}
                      onChange={(e) => updateInput('yearsToAnalyze', e.target.value)}
                      placeholder="10"
                      min="1"
                      max="30"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Cost Comparison</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Renting</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">
                      {formatCurrency(inputs.monthlyRent)}
                    </div>
                    <div className="text-sm text-blue-600">per month</div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">Buying</span>
                    </div>
                    <div className="text-2xl font-bold text-green-700">
                      {formatCurrency(calculations.totalMonthlyBuying)}
                    </div>
                    <div className="text-sm text-green-600">per month</div>
                    
                    <div className="mt-3 space-y-1 text-xs text-green-700">
                      <div className="flex justify-between">
                        <span>Mortgage Payment:</span>
                        <span>{formatCurrency(calculations.monthlyPayment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Property Tax:</span>
                        <span>{formatCurrency(calculations.monthlyTaxes)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Insurance:</span>
                        <span>{formatCurrency(calculations.monthlyInsurance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maintenance:</span>
                        <span>{formatCurrency(calculations.monthlyMaintenance)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className={`p-4 rounded-lg ${
                    calculations.breakEvenYear ? 'bg-yellow-50' : 'bg-red-50'
                  }`}>
                    <h4 className="font-semibold mb-2">
                      {calculations.breakEvenYear ? 'Break-Even Analysis' : 'Financial Outcome'}
                    </h4>
                    {calculations.breakEvenYear ? (
                      <p className="text-sm">
                        Based on your inputs, buying becomes more financially advantageous 
                        after <span className="font-bold">{calculations.breakEvenYear} years</span>.
                      </p>
                    ) : (
                      <p className="text-sm text-red-700">
                        Renting appears to be more cost-effective over the {inputs.yearsToAnalyze}-year period.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  After {inputs.yearsToAnalyze} Years
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Total Rent Paid:</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(calculations.finalRentCost)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Net Home Ownership Position:</span>
                    <span className={`font-medium ${
                      calculations.finalBuyNetPosition > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {calculations.finalBuyNetPosition > 0 ? '+' : ''}
                      {formatCurrency(calculations.finalBuyNetPosition)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Estimated Home Value:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(calculations.finalHomeValue)}
                    </span>
                  </div>

                  <div className={`p-3 rounded-lg ${
                    calculations.finalBuyNetPosition > -calculations.finalRentCost 
                      ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className="text-sm font-medium">
                      Net Difference: {formatCurrency(Math.abs(calculations.finalBuyNetPosition + calculations.finalRentCost))}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {calculations.finalBuyNetPosition > -calculations.finalRentCost 
                        ? 'Buying is more advantageous' 
                        : 'Renting is more cost-effective'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Position Over Time</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="year" 
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          formatCurrency(value), 
                          name
                        ]}
                        labelFormatter={(label) => `Year ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="Renting"
                        stroke="#EF4444"
                        strokeWidth={2}
                        dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Buying"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600">Renting Net Position</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Buying Net Position</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Considerations */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Considerations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Advantages of Buying</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Build equity and long-term wealth</li>
                <li>• Stability and control over living space</li>
                <li>• Potential tax benefits (mortgage interest deduction)</li>
                <li>• Protection from rent increases</li>
                <li>• Ability to modify and improve property</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Advantages of Renting</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Lower upfront costs and more liquidity</li>
                <li>• Flexibility to relocate easily</li>
                <li>• No maintenance or repair responsibilities</li>
                <li>• No market risk or property value fluctuation</li>
                <li>• Predictable monthly housing costs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}