import { AmortizationPayment } from '@/lib/api';

export interface ExtraPaymentScenario {
  name: string;
  monthlyExtra: number;
  yearlyExtra: number;
  oneTimeExtra: number;
  oneTimePaymentMonth: number;
}

export interface ExtraPaymentResult {
  scenario: ExtraPaymentScenario;
  totalInterest: number;
  totalPayments: number;
  yearsOff: number;
  monthsOff: number;
  interestSavings: number;
  schedule: AmortizationPayment[];
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatPercent(rate: number, decimals: number = 2): string {
  return `${rate.toFixed(decimals)}%`;
}

export function calculateDebtToIncomeRatio(monthlyDebts: number, monthlyIncome: number): number {
  if (monthlyIncome === 0) return 0;
  return (monthlyDebts / monthlyIncome) * 100;
}

export function calculateLoanToValueRatio(loanAmount: number, propertyValue: number): number {
  if (propertyValue === 0) return 0;
  return (loanAmount / propertyValue) * 100;
}

export function calculateExtraPaymentImpact(
  principal: number,
  annualRate: number,
  years: number,
  scenario: ExtraPaymentScenario
): ExtraPaymentResult {
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, years);
  
  let remainingBalance = principal;
  let totalInterest = 0;
  let totalPayments = 0;
  const schedule: AmortizationPayment[] = [];
  const startDate = new Date();
  
  for (let i = 1; i <= numberOfPayments && remainingBalance > 0; i++) {
    const interestPayment = remainingBalance * monthlyRate;
    let principalPayment = monthlyPayment - interestPayment;
    let extraPayment = 0;
    
    // Add monthly extra payment
    extraPayment += scenario.monthlyExtra;
    
    // Add yearly extra payment (on anniversary month)
    if (i % 12 === 1 && i > 1) {
      extraPayment += scenario.yearlyExtra;
    }
    
    // Add one-time extra payment
    if (i === scenario.oneTimePaymentMonth) {
      extraPayment += scenario.oneTimeExtra;
    }
    
    // Ensure we don't overpay
    const totalPrincipalPayment = Math.min(principalPayment + extraPayment, remainingBalance);
    extraPayment = totalPrincipalPayment - principalPayment;
    principalPayment = totalPrincipalPayment;
    
    remainingBalance -= principalPayment;
    totalInterest += interestPayment;
    totalPayments++;
    
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + i);
    
    schedule.push({
      paymentNumber: i,
      paymentDate: paymentDate.toISOString().split('T')[0],
      principal: Math.round(principalPayment * 100) / 100,
      interest: Math.round(interestPayment * 100) / 100,
      totalPayment: Math.round((monthlyPayment + extraPayment) * 100) / 100,
      remainingBalance: Math.max(0, Math.round(remainingBalance * 100) / 100)
    });
  }
  
  const originalTotalPayments = numberOfPayments;
  const originalTotalInterest = (monthlyPayment * numberOfPayments) - principal;
  
  return {
    scenario,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPayments,
    yearsOff: Math.floor((originalTotalPayments - totalPayments) / 12),
    monthsOff: (originalTotalPayments - totalPayments) % 12,
    interestSavings: Math.round((originalTotalInterest - totalInterest) * 100) / 100,
    schedule
  };
}

export function calculateMonthlyPayment(principal: number, annualRate: number, years: number): number {
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  
  if (monthlyRate === 0) {
    return principal / numberOfPayments;
  }
  
  const monthlyPayment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  return Math.round(monthlyPayment * 100) / 100;
}

export function generateAmortizationSchedule(
  principal: number, 
  annualRate: number, 
  years: number
): AmortizationPayment[] {
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, years);
  
  const schedule: AmortizationPayment[] = [];
  let remainingBalance = principal;
  const startDate = new Date();
  
  for (let i = 1; i <= numberOfPayments; i++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingBalance -= principalPayment;
    
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + i);
    
    schedule.push({
      paymentNumber: i,
      paymentDate: paymentDate.toISOString().split('T')[0],
      principal: Math.round(principalPayment * 100) / 100,
      interest: Math.round(interestPayment * 100) / 100,
      totalPayment: monthlyPayment,
      remainingBalance: Math.max(0, Math.round(remainingBalance * 100) / 100)
    });
  }
  
  return schedule;
}

export function calculateRefinanceSavings(
  currentBalance: number,
  currentRate: number,
  currentYearsRemaining: number,
  newRate: number,
  newYears: number,
  closingCosts: number
) {
  const currentMonthlyPayment = calculateMonthlyPayment(currentBalance, currentRate, currentYearsRemaining);
  const newMonthlyPayment = calculateMonthlyPayment(currentBalance, newRate, newYears);
  
  const currentTotalInterest = (currentMonthlyPayment * currentYearsRemaining * 12) - currentBalance;
  const newTotalInterest = (newMonthlyPayment * newYears * 12) - currentBalance;
  
  const monthlyDifference = currentMonthlyPayment - newMonthlyPayment;
  const totalInterestSavings = currentTotalInterest - newTotalInterest - closingCosts;
  const breakEvenMonths = closingCosts / monthlyDifference;
  
  return {
    currentMonthlyPayment,
    newMonthlyPayment,
    monthlyDifference,
    currentTotalInterest,
    newTotalInterest,
    totalInterestSavings,
    breakEvenMonths: Math.round(breakEvenMonths),
    worthRefinancing: totalInterestSavings > 0
  };
}