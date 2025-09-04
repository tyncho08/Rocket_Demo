import apiClient from '../api-client';

export interface MortgageCalculationDto {
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
  downPayment?: number;
  propertyValue?: number;
  propertyTax?: number;
  homeInsurance?: number;
  pmi?: number;
  hoa?: number;
}

export interface MortgageCalculationResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  principalAndInterest: number;
  monthlyPropertyTax: number;
  monthlyHomeInsurance: number;
  monthlyPMI: number;
  monthlyHOA: number;
  amortizationSchedule: AmortizationPayment[];
}

export interface AmortizationPayment {
  paymentNumber: number;
  paymentDate: string;
  principal: number;
  interest: number;
  totalPayment: number;
  remainingBalance: number;
}

export interface PreApprovalDto {
  annualIncome: number;
  monthlyDebts: number;
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
  downPayment: number;
}

export interface PreApprovalResult {
  isApproved: boolean;
  maxLoanAmount: number;
  debtToIncomeRatio: number;
  monthlyPayment: number;
  requiredIncome: number;
  message: string;
}

export const mortgageService = {
  async calculateMortgage(data: MortgageCalculationDto): Promise<MortgageCalculationResult> {
    const response = await apiClient.post<MortgageCalculationResult>('/mortgage/calculate', data);
    return response.data;
  },

  async checkPreApproval(data: PreApprovalDto): Promise<PreApprovalResult> {
    const response = await apiClient.post<PreApprovalResult>('/mortgage/preapproval', data);
    return response.data;
  },

  // Local calculation for instant feedback
  calculateMonthlyPayment(principal: number, annualRate: number, years: number): number {
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;
    
    if (monthlyRate === 0) {
      return principal / numberOfPayments;
    }
    
    const monthlyPayment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    return Math.round(monthlyPayment * 100) / 100;
  },

  // Generate amortization schedule locally
  generateAmortizationSchedule(
    principal: number, 
    annualRate: number, 
    years: number
  ): AmortizationPayment[] {
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;
    const monthlyPayment = this.calculateMonthlyPayment(principal, annualRate, years);
    
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
};