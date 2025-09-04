'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mortgageService } from '@/lib/api';
import { formatCurrency, formatPercent, calculateDebtToIncomeRatio } from '@/lib/utils/mortgage-utils';
import { X, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const preApprovalSchema = z.object({
  annualIncome: z.number().min(1000, 'Annual income must be at least $1,000'),
  monthlyDebts: z.number().min(0, 'Monthly debts cannot be negative'),
  downPayment: z.number().min(0, 'Down payment cannot be negative')
});

type PreApprovalFormData = z.infer<typeof preApprovalSchema>;

interface PreApprovalCheckerProps {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  onClose: () => void;
}

export function PreApprovalChecker({
  loanAmount,
  interestRate,
  loanTerm,
  onClose
}: PreApprovalCheckerProps) {
  const [result, setResult] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<PreApprovalFormData>({
    resolver: zodResolver(preApprovalSchema),
    defaultValues: {
      annualIncome: 80000,
      monthlyDebts: 500,
      downPayment: loanAmount * 0.2
    }
  });

  const watchedValues = watch();
  const monthlyIncome = watchedValues.annualIncome / 12;
  const dtiRatio = calculateDebtToIncomeRatio(watchedValues.monthlyDebts, monthlyIncome);
  const monthlyPayment = mortgageService.calculateMonthlyPayment(loanAmount, interestRate, loanTerm);

  const onSubmit = async (data: PreApprovalFormData) => {
    setIsChecking(true);
    try {
      const preApprovalResult = await mortgageService.checkPreApproval({
        annualIncome: data.annualIncome,
        monthlyDebts: data.monthlyDebts,
        loanAmount,
        interestRate,
        loanTermYears: loanTerm,
        downPayment: data.downPayment
      });
      setResult(preApprovalResult);
    } catch (error) {
      // Fallback to local calculation
      const totalMonthlyDebt = data.monthlyDebts + monthlyPayment;
      const monthlyIncome = data.annualIncome / 12;
      const dtiRatio = (totalMonthlyDebt / monthlyIncome) * 100;
      const frontEndRatio = (monthlyPayment / monthlyIncome) * 100;

      const localResult = {
        isApproved: dtiRatio <= 43 && frontEndRatio <= 28,
        maxLoanAmount: Math.min(
          (monthlyIncome * 0.28 * loanTerm * 12) / (1 + (interestRate / 100 / 12 * loanTerm * 12)),
          loanAmount
        ),
        debtToIncomeRatio: dtiRatio,
        monthlyPayment,
        requiredIncome: (monthlyPayment + data.monthlyDebts) / 0.43 * 12,
        message: dtiRatio <= 43 
          ? 'Congratulations! You likely qualify for this loan.' 
          : 'Your debt-to-income ratio is too high. Consider reducing debts or increasing income.'
      };
      setResult(localResult);
    } finally {
      setIsChecking(false);
    }
  };

  const getApprovalIcon = () => {
    if (!result) return null;
    
    if (result.isApproved) {
      return <CheckCircle className="h-6 w-6 text-green-600" />;
    } else if (result.debtToIncomeRatio > 50) {
      return <XCircle className="h-6 w-6 text-red-600" />;
    } else {
      return <AlertCircle className="h-6 w-6 text-yellow-600" />;
    }
  };

  const getApprovalColor = () => {
    if (!result) return 'border-gray-200';
    
    if (result.isApproved) {
      return 'border-green-200 bg-green-50';
    } else if (result.debtToIncomeRatio > 50) {
      return 'border-red-200 bg-red-50';
    } else {
      return 'border-yellow-200 bg-yellow-50';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pre-Approval Checker</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Check if you qualify for a loan of {formatCurrency(loanAmount)} at {formatPercent(interestRate)}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="annualIncome"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                label="Annual Gross Income"
                prefix="$"
                error={errors.annualIncome?.message}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />

          <Controller
            name="monthlyDebts"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                label="Monthly Debt Payments"
                prefix="$"
                error={errors.monthlyDebts?.message}
                onChange={(e) => field.onChange(Number(e.target.value))}
                placeholder="Credit cards, car loans, student loans, etc."
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
                error={errors.downPayment?.message}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />

          <Button
            type="submit"
            disabled={isChecking}
            className="w-full"
          >
            {isChecking ? 'Checking...' : 'Check Pre-Approval'}
          </Button>
        </form>

        {/* Real-time indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-3 rounded-lg border ${dtiRatio <= 43 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <p className="text-sm font-medium">Debt-to-Income Ratio</p>
            <p className={`text-lg font-bold ${dtiRatio <= 43 ? 'text-green-600' : 'text-red-600'}`}>
              {dtiRatio.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-600">Target: ≤ 43%</p>
          </div>

          <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-sm font-medium">Monthly Income</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(monthlyIncome)}
            </p>
            <p className="text-xs text-gray-600">Gross monthly income</p>
          </div>

          <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-sm font-medium">Monthly Payment</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(monthlyPayment)}
            </p>
            <p className="text-xs text-gray-600">Principal & interest</p>
          </div>
        </div>

        {/* Results */}
        {result && (
          <Card className={`${getApprovalColor()}`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                {getApprovalIcon()}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    {result.isApproved ? 'Pre-Approved!' : 'Not Pre-Approved'}
                  </h3>
                  <p className="text-gray-700 mb-4">{result.message}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Maximum Loan Amount</p>
                      <p className="font-semibold text-lg">
                        {formatCurrency(result.maxLoanAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Your DTI Ratio</p>
                      <p className="font-semibold text-lg">
                        {formatPercent(result.debtToIncomeRatio)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Monthly Payment</p>
                      <p className="font-semibold text-lg">
                        {formatCurrency(result.monthlyPayment)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Required Income</p>
                      <p className="font-semibold text-lg">
                        {formatCurrency(result.requiredIncome)}
                      </p>
                    </div>
                  </div>

                  {!result.isApproved && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Tips to Improve Your Pre-Approval</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Pay down existing debts to lower your DTI ratio</li>
                        <li>• Increase your down payment to reduce loan amount</li>
                        <li>• Consider a longer loan term to reduce monthly payments</li>
                        <li>• Improve your credit score for better rates</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}