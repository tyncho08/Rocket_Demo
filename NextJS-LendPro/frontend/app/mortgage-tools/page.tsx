'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navbar } from '@/components/layouts/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AmortizationChart } from '@/components/charts/amortization-chart';
import { PaymentBreakdownChart } from '@/components/charts/payment-breakdown-chart';
import { AmortizationTable } from '@/components/tables/amortization-table';
import { CalculationHistory } from '@/components/mortgage/calculation-history';
import { PreApprovalChecker } from '@/components/mortgage/pre-approval-checker';
import { RefinanceCalculator } from '@/components/calculators/refinance-calculator';
import { RentVsBuyCalculator } from '@/components/calculators/rent-vs-buy-calculator';
import { useMortgageStore } from '@/lib/store/use-mortgage-store';
import { mortgageService } from '@/lib/api';
import { formatCurrency, formatPercent, generateAmortizationSchedule } from '@/lib/utils/mortgage-utils';
import { Calculator, History, TrendingUp, FileText, Save } from 'lucide-react';

const mortgageSchema = z.object({
  loanAmount: z.number().min(1000, 'Loan amount must be at least $1,000'),
  interestRate: z.number().min(0.1).max(30, 'Interest rate must be between 0.1% and 30%'),
  loanTermYears: z.number().min(1).max(50, 'Loan term must be between 1 and 50 years'),
  downPayment: z.number().min(0, 'Down payment cannot be negative').optional(),
  propertyValue: z.number().min(0, 'Property value cannot be negative').optional(),
  propertyTax: z.number().min(0).optional(),
  homeInsurance: z.number().min(0).optional(),
  pmi: z.number().min(0).optional(),
  hoa: z.number().min(0).optional()
});

type MortgageFormData = z.infer<typeof mortgageSchema>;

export default function MortgageCalculatorPage() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'refinance' | 'rent-vs-buy'>('calculator');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPreApproval, setShowPreApproval] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const { 
    currentCalculation, 
    currentResult,
    setCalculation,
    setResult,
    saveToHistory,
    history 
  } = useMortgageStore();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue
  } = useForm<MortgageFormData>({
    resolver: zodResolver(mortgageSchema),
    defaultValues: {
      loanAmount: currentCalculation?.loanAmount || 300000,
      interestRate: currentCalculation?.interestRate || 6.5,
      loanTermYears: currentCalculation?.loanTermYears || 30,
      downPayment: currentCalculation?.downPayment || 60000,
      propertyValue: currentCalculation?.propertyValue || 360000,
      propertyTax: currentCalculation?.propertyTax || 200,
      homeInsurance: currentCalculation?.homeInsurance || 100,
      pmi: currentCalculation?.pmi || 0,
      hoa: currentCalculation?.hoa || 0
    }
  });

  const watchedValues = watch();

  // Real-time calculation for immediate feedback
  const calculationResult = useMemo(() => {
    try {
      const monthlyPayment = mortgageService.calculateMonthlyPayment(
        watchedValues.loanAmount,
        watchedValues.interestRate,
        watchedValues.loanTermYears
      );

      const totalPayment = monthlyPayment * watchedValues.loanTermYears * 12;
      const totalInterest = totalPayment - watchedValues.loanAmount;

      const amortizationSchedule = generateAmortizationSchedule(
        watchedValues.loanAmount,
        watchedValues.interestRate,
        watchedValues.loanTermYears
      );

      return {
        monthlyPayment,
        totalPayment,
        totalInterest,
        principalAndInterest: monthlyPayment,
        monthlyPropertyTax: watchedValues.propertyTax || 0,
        monthlyHomeInsurance: watchedValues.homeInsurance || 0,
        monthlyPMI: watchedValues.pmi || 0,
        monthlyHOA: watchedValues.hoa || 0,
        amortizationSchedule
      };
    } catch {
      return null;
    }
  }, [watchedValues]);

  const totalMonthlyPayment = calculationResult ? 
    calculationResult.monthlyPayment + 
    calculationResult.monthlyPropertyTax + 
    calculationResult.monthlyHomeInsurance + 
    calculationResult.monthlyPMI + 
    calculationResult.monthlyHOA : 0;

  const onSubmit = async (data: MortgageFormData) => {
    setIsCalculating(true);
    try {
      const result = await mortgageService.calculateMortgage(data);
      setCalculation(data);
      setResult(result);
    } catch (error) {
      console.error('Calculation error:', error);
      // Fallback to local calculation
      if (calculationResult) {
        setCalculation(data);
        setResult(calculationResult);
      }
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSaveCalculation = () => {
    if (calculationResult) {
      const name = `${formatCurrency(watchedValues.loanAmount)} at ${formatPercent(watchedValues.interestRate)}`;
      saveToHistory(name);
    }
  };

  const loadFromHistory = (historyItem: any) => {
    Object.keys(historyItem.params).forEach((key) => {
      setValue(key as keyof MortgageFormData, historyItem.params[key]);
    });
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mortgage Tools & Calculators
        </h1>
        <p className="text-gray-600">
          Comprehensive financial calculators for all your mortgage needs
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'calculator'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calculator className="h-4 w-4 inline mr-2" />
            Mortgage Calculator
          </button>
          <button
            onClick={() => setActiveTab('refinance')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'refinance'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="h-4 w-4 inline mr-2" />
            Refinance Calculator
          </button>
          <button
            onClick={() => setActiveTab('rent-vs-buy')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'rent-vs-buy'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Rent vs Buy
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calculator Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Loan Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Controller
                name="loanAmount"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    label="Loan Amount"
                    prefix="$"
                    error={errors.loanAmount?.message}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />

              <Controller
                name="interestRate"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    label="Interest Rate (Annual)"
                    suffix="%"
                    error={errors.interestRate?.message}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />

              <Controller
                name="loanTermYears"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    label="Loan Term"
                    suffix="years"
                    error={errors.loanTermYears?.message}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />

              {/* Advanced Options */}
              <div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full"
                >
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                </Button>

                {showAdvanced && (
                  <div className="mt-4 space-y-4 border-t pt-4">
                    <Controller
                      name="propertyValue"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          label="Property Value"
                          prefix="$"
                          onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                        />
                      )}
                    />

                    <Controller
                      name="downPayment"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          label="Down Payment"
                          prefix="$"
                          onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                        />
                      )}
                    />

                    <Controller
                      name="propertyTax"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          label="Property Tax (Monthly)"
                          prefix="$"
                          onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                        />
                      )}
                    />

                    <Controller
                      name="homeInsurance"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          label="Home Insurance (Monthly)"
                          prefix="$"
                          onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                        />
                      )}
                    />

                    <Controller
                      name="pmi"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          label="PMI (Monthly)"
                          prefix="$"
                          onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                        />
                      )}
                    />

                    <Controller
                      name="hoa"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          label="HOA Fees (Monthly)"
                          prefix="$"
                          onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                        />
                      )}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isCalculating}
                  className="flex-1"
                >
                  {isCalculating ? 'Calculating...' : 'Calculate'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveCalculation}
                  disabled={!calculationResult}
                >
                  <Save className="h-4 w-4" />
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <History className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {calculationResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Payment Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Principal & Interest</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(calculationResult.monthlyPayment)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Monthly Payment</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(totalMonthlyPayment)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {calculationResult.monthlyPropertyTax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property Tax</span>
                      <span>{formatCurrency(calculationResult.monthlyPropertyTax)}</span>
                    </div>
                  )}
                  {calculationResult.monthlyHomeInsurance > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Home Insurance</span>
                      <span>{formatCurrency(calculationResult.monthlyHomeInsurance)}</span>
                    </div>
                  )}
                  {calculationResult.monthlyPMI > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">PMI</span>
                      <span>{formatCurrency(calculationResult.monthlyPMI)}</span>
                    </div>
                  )}
                  {calculationResult.monthlyHOA > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">HOA</span>
                      <span>{formatCurrency(calculationResult.monthlyHOA)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Interest</span>
                    <span className="font-semibold">
                      {formatCurrency(calculationResult.totalInterest)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Paid</span>
                    <span className="font-semibold">
                      {formatCurrency(calculationResult.totalPayment)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowPreApproval(!showPreApproval)}
                    className="flex-1"
                  >
                    Pre-Approval Check
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

          {/* Charts and Tables */}
          {calculationResult && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PaymentBreakdownChart
                  principal={calculationResult.monthlyPayment}
                  interest={calculationResult.totalInterest / (watchedValues.loanTermYears * 12)}
                  taxes={calculationResult.monthlyPropertyTax}
                  insurance={calculationResult.monthlyHomeInsurance}
                  pmi={calculationResult.monthlyPMI}
                  hoa={calculationResult.monthlyHOA}
                />

                <AmortizationChart
                  schedule={calculationResult.amortizationSchedule.slice(0, 12)}
                />
              </div>

              <AmortizationTable
                schedule={calculationResult.amortizationSchedule}
                loanAmount={watchedValues.loanAmount}
              />
            </>
          )}

          {/* History Panel */}
          {showHistory && (
            <CalculationHistory
              history={history}
              onLoad={loadFromHistory}
              onClose={() => setShowHistory(false)}
            />
          )}

          {/* Pre-Approval Panel */}
          {showPreApproval && (
            <PreApprovalChecker
              loanAmount={watchedValues.loanAmount}
              interestRate={watchedValues.interestRate}
              loanTerm={watchedValues.loanTermYears}
              onClose={() => setShowPreApproval(false)}
            />
          )}
        </div>
      )}

        {activeTab === 'refinance' && <RefinanceCalculator />}

        {activeTab === 'rent-vs-buy' && <RentVsBuyCalculator />}
      </div>
    </div>
  );
}