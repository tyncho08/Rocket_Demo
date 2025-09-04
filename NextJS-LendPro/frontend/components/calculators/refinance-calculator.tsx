'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils/mortgage-utils';
import { Calculator, TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react';

interface RefinanceInputs {
  currentLoanBalance: number;
  currentInterestRate: number;
  currentLoanTermYears: number;
  newInterestRate: number;
  newLoanTermYears: number;
  closingCosts: number;
  cashOut: number;
}

const loanTermOptions = [
  { value: '15', label: '15 Years' },
  { value: '20', label: '20 Years' },
  { value: '25', label: '25 Years' },
  { value: '30', label: '30 Years' }
];

export function RefinanceCalculator() {
  const [inputs, setInputs] = useState<RefinanceInputs>({
    currentLoanBalance: 350000,
    currentInterestRate: 7.25,
    currentLoanTermYears: 30,
    newInterestRate: 6.5,
    newLoanTermYears: 30,
    closingCosts: 5000,
    cashOut: 0
  });

  const calculateMonthlyPayment = (principal: number, rate: number, years: number) => {
    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = years * 12;
    
    if (monthlyRate === 0) return principal / numberOfPayments;
    
    return (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) / 
           (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  };

  const calculations = useMemo(() => {
    const currentMonthlyPayment = calculateMonthlyPayment(
      inputs.currentLoanBalance,
      inputs.currentInterestRate,
      inputs.currentLoanTermYears
    );

    const newLoanAmount = inputs.currentLoanBalance + inputs.closingCosts + inputs.cashOut;
    
    const newMonthlyPayment = calculateMonthlyPayment(
      newLoanAmount,
      inputs.newInterestRate,
      inputs.newLoanTermYears
    );

    const monthlyPaymentSavings = currentMonthlyPayment - newMonthlyPayment;
    const totalCurrentPayments = currentMonthlyPayment * inputs.currentLoanTermYears * 12;
    const totalNewPayments = newMonthlyPayment * inputs.newLoanTermYears * 12;
    const totalInterestSavings = totalCurrentPayments - totalNewPayments;

    // Break-even analysis
    const breakEvenMonths = monthlyPaymentSavings > 0 ? 
      (inputs.closingCosts + inputs.cashOut) / monthlyPaymentSavings : 0;

    return {
      currentMonthlyPayment,
      newMonthlyPayment,
      newLoanAmount,
      monthlyPaymentSavings,
      totalInterestSavings,
      breakEvenMonths,
      breakEvenYears: breakEvenMonths / 12
    };
  }, [inputs]);

  const updateInput = (field: keyof RefinanceInputs, value: string) => {
    setInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const isGoodDeal = calculations.monthlyPaymentSavings > 0 && calculations.breakEvenYears < 5;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Refinance Calculator
          </CardTitle>
          <p className="text-sm text-gray-600">
            Compare your current mortgage with refinancing options
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Loan Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Loan Balance
                    </label>
                    <Input
                      type="number"
                      value={inputs.currentLoanBalance}
                      onChange={(e) => updateInput('currentLoanBalance', e.target.value)}
                      placeholder="350000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Interest Rate (%)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={inputs.currentInterestRate}
                      onChange={(e) => updateInput('currentInterestRate', e.target.value)}
                      placeholder="7.25"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Loan Term
                    </label>
                    <Select
                      value={inputs.currentLoanTermYears.toString()}
                      options={loanTermOptions}
                      onChange={(value) => updateInput('currentLoanTermYears', value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">New Loan Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Interest Rate (%)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={inputs.newInterestRate}
                      onChange={(e) => updateInput('newInterestRate', e.target.value)}
                      placeholder="6.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Loan Term
                    </label>
                    <Select
                      value={inputs.newLoanTermYears.toString()}
                      options={loanTermOptions}
                      onChange={(value) => updateInput('newLoanTermYears', value)}
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
                      placeholder="5000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cash Out Amount (Optional)
                    </label>
                    <Input
                      type="number"
                      value={inputs.cashOut}
                      onChange={(e) => updateInput('cashOut', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Refinance Analysis</h3>
                
                {/* Key Metrics */}
                <div className="grid grid-cols-1 gap-4 mb-6">
                  <div className={`p-4 rounded-lg border-2 ${
                    isGoodDeal ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isGoodDeal ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-600" />
                        )}
                        <span className="font-medium">
                          {isGoodDeal ? 'Good Refinance Opportunity' : 'Consider Carefully'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {isGoodDeal 
                        ? 'This refinance could save you money'
                        : 'Break-even period is longer than typical recommendation'
                      }
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Current Monthly Payment</span>
                      <span className="font-semibold text-lg">
                        {formatCurrency(calculations.currentMonthlyPayment)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-600">New Monthly Payment</span>
                      <span className="font-semibold text-lg text-blue-700">
                        {formatCurrency(calculations.newMonthlyPayment)}
                      </span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    calculations.monthlyPaymentSavings > 0 ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {calculations.monthlyPaymentSavings > 0 ? (
                          <TrendingDown className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`${
                          calculations.monthlyPaymentSavings > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          Monthly {calculations.monthlyPaymentSavings > 0 ? 'Savings' : 'Increase'}
                        </span>
                      </div>
                      <span className={`font-semibold text-lg ${
                        calculations.monthlyPaymentSavings > 0 ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {formatCurrency(Math.abs(calculations.monthlyPaymentSavings))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Break-even Analysis */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Break-even Analysis</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Total Refinancing Costs</span>
                    <span className="font-medium">
                      {formatCurrency(inputs.closingCosts + inputs.cashOut)}
                    </span>
                  </div>
                  
                  {calculations.monthlyPaymentSavings > 0 ? (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Break-even Time</span>
                        <span className="font-medium">
                          {calculations.breakEvenYears.toFixed(1)} years
                          ({Math.ceil(calculations.breakEvenMonths)} months)
                        </span>
                      </div>
                      
                      <div className="p-3 bg-blue-50 rounded-lg text-sm">
                        <p className="text-blue-800">
                          You'll recover your refinancing costs in {Math.ceil(calculations.breakEvenMonths)} months.
                          After that, you'll save {formatCurrency(calculations.monthlyPaymentSavings)} every month.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="p-3 bg-red-50 rounded-lg text-sm">
                      <p className="text-red-800">
                        This refinance would increase your monthly payment. 
                        Consider if lower lifetime interest costs or cash-out benefits justify the higher payment.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Benefits */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Additional Considerations</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>
                      Total interest over new loan term: {formatCurrency(calculations.newMonthlyPayment * inputs.newLoanTermYears * 12 - calculations.newLoanAmount)}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>
                      New loan amount: {formatCurrency(calculations.newLoanAmount)}
                    </span>
                  </div>
                  {inputs.cashOut > 0 && (
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-green-700">
                        Cash out amount: {formatCurrency(inputs.cashOut)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Refinancing Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">When to Refinance</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Interest rates have dropped by 0.5% or more</li>
                <li>• Your credit score has improved significantly</li>
                <li>• You want to switch from ARM to fixed-rate</li>
                <li>• You need cash for home improvements</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Things to Consider</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Closing costs typically range from 2-5% of loan</li>
                <li>• Break-even should ideally be under 2-3 years</li>
                <li>• Consider how long you plan to stay in home</li>
                <li>• Factor in all costs including appraisal fees</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}