export interface AmortizationScheduleItem {
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

export function calculateMonthlyPayment(
  principal: number,
  annualInterestRate: number,
  loanTermYears: number
): number {
  const monthlyInterestRate = annualInterestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;
  
  if (monthlyInterestRate === 0) {
    return principal / numberOfPayments;
  }
  
  const monthlyPayment = 
    (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  
  return monthlyPayment;
}

export function generateAmortizationSchedule(
  principal: number,
  annualInterestRate: number,
  loanTermYears: number
): AmortizationScheduleItem[] {
  const monthlyInterestRate = annualInterestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;
  const monthlyPayment = calculateMonthlyPayment(principal, annualInterestRate, loanTermYears);
  
  const schedule: AmortizationScheduleItem[] = [];
  let remainingBalance = principal;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  
  for (let payment = 1; payment <= numberOfPayments; payment++) {
    const interestPayment = remainingBalance * monthlyInterestRate;
    const principalPayment = monthlyPayment - interestPayment;
    
    remainingBalance -= principalPayment;
    cumulativeInterest += interestPayment;
    cumulativePrincipal += principalPayment;
    
    // Prevent negative balance due to floating point precision
    if (remainingBalance < 0) {
      remainingBalance = 0;
    }
    
    schedule.push({
      payment,
      principal: principalPayment,
      interest: interestPayment,
      balance: remainingBalance,
      cumulativeInterest,
      cumulativePrincipal,
    });
  }
  
  return schedule;
}

export function calculateTotalInterest(
  principal: number,
  annualInterestRate: number,
  loanTermYears: number
): number {
  const monthlyPayment = calculateMonthlyPayment(principal, annualInterestRate, loanTermYears);
  const totalPayments = monthlyPayment * loanTermYears * 12;
  return totalPayments - principal;
}

export function calculateRentVsBuy(
  homePrice: number,
  downPayment: number,
  interestRate: number,
  loanTermYears: number,
  monthlyRent: number,
  propertyTaxRate: number,
  homeInsurance: number,
  maintenanceRate: number,
  rentIncreaseRate: number,
  homeAppreciationRate: number,
  yearsToAnalyze: number
): { buyingCost: number; rentingCost: number; breakEvenYear: number } {
  const loanAmount = homePrice - downPayment;
  const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanTermYears);
  
  let totalBuyingCost = downPayment;
  let totalRentingCost = 0;
  let currentRent = monthlyRent;
  let breakEvenYear = 0;
  
  for (let year = 1; year <= yearsToAnalyze; year++) {
    // Buying costs
    const annualMortgagePayments = monthlyPayment * 12;
    const annualPropertyTax = homePrice * (propertyTaxRate / 100);
    const annualInsurance = homeInsurance * 12;
    const annualMaintenance = homePrice * (maintenanceRate / 100);
    
    totalBuyingCost += annualMortgagePayments + annualPropertyTax + annualInsurance + annualMaintenance;
    
    // Subtract home appreciation
    const homeAppreciation = homePrice * Math.pow(1 + homeAppreciationRate / 100, year) - homePrice;
    totalBuyingCost -= homeAppreciation;
    
    // Renting costs
    totalRentingCost += currentRent * 12;
    currentRent *= (1 + rentIncreaseRate / 100);
    
    // Check for break-even point
    if (breakEvenYear === 0 && totalBuyingCost < totalRentingCost) {
      breakEvenYear = year;
    }
  }
  
  return {
    buyingCost: totalBuyingCost,
    rentingCost: totalRentingCost,
    breakEvenYear
  };
}

export function calculateRefinanceBreakEven(
  currentBalance: number,
  currentRate: number,
  newRate: number,
  loanTermYears: number,
  closingCosts: number
): { monthlySavings: number; breakEvenMonths: number; totalSavings: number } {
  const currentPayment = calculateMonthlyPayment(currentBalance, currentRate, loanTermYears);
  const newPayment = calculateMonthlyPayment(currentBalance, newRate, loanTermYears);
  
  const monthlySavings = currentPayment - newPayment;
  const breakEvenMonths = monthlySavings > 0 ? closingCosts / monthlySavings : 0;
  const totalSavings = monthlySavings * loanTermYears * 12 - closingCosts;
  
  return {
    monthlySavings,
    breakEvenMonths,
    totalSavings
  };
}