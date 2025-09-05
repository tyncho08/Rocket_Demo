import apiClient from '../api-client';
import { apolloClient } from '@/lib/apollo-client';
import { CALCULATE_MORTGAGE_QUERY } from '@/lib/graphql/queries';

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
    try {
      // Use GraphQL query instead of REST API
      const { data: result } = await apolloClient.query({
        query: CALCULATE_MORTGAGE_QUERY,
        variables: {
          input: {
            propertyPrice: data.propertyValue || data.loanAmount + (data.downPayment || 0),
            downPayment: data.downPayment || 0,
            interestRate: data.interestRate,
            loanTermYears: data.loanTermYears
          }
        },
        fetchPolicy: 'no-cache' // Always get fresh calculation
      });

      const mortgageResult = result.calculateMortgage;
      
      // Transform GraphQL response to expected format
      return {
        monthlyPayment: mortgageResult.monthlyPayment,
        totalPayment: mortgageResult.totalPayment,
        totalInterest: mortgageResult.totalInterest,
        principalAndInterest: mortgageResult.monthlyPayment,
        monthlyPropertyTax: data.propertyTax ? data.propertyTax / 12 : 0,
        monthlyHomeInsurance: data.homeInsurance ? data.homeInsurance / 12 : 0,
        monthlyPMI: data.pmi || 0,
        monthlyHOA: data.hoa || 0,
        amortizationSchedule: mortgageResult.amortizationSchedule.map((payment: any) => ({
          paymentNumber: payment.paymentNumber,
          paymentDate: new Date().toISOString().split('T')[0], // Simplified for now
          principal: payment.principalAmount,
          interest: payment.interestAmount,
          totalPayment: payment.paymentAmount,
          remainingBalance: payment.remainingBalance
        }))
      };
    } catch (error) {
      console.error('GraphQL mortgage calculation failed:', error);
      // Fallback to local calculation
      return this.calculateMortgageLocally(data);
    }
  },

  // Add fallback local calculation method
  calculateMortgageLocally(data: MortgageCalculationDto): MortgageCalculationResult {
    const loanAmount = data.loanAmount;
    const monthlyPayment = this.calculateMonthlyPayment(loanAmount, data.interestRate, data.loanTermYears);
    const totalPayment = monthlyPayment * data.loanTermYears * 12;
    const totalInterest = totalPayment - loanAmount;
    const amortizationSchedule = this.generateAmortizationSchedule(loanAmount, data.interestRate, data.loanTermYears);
    
    return {
      monthlyPayment,
      totalPayment,
      totalInterest,
      principalAndInterest: monthlyPayment,
      monthlyPropertyTax: data.propertyTax ? data.propertyTax / 12 : 0,
      monthlyHomeInsurance: data.homeInsurance ? data.homeInsurance / 12 : 0,
      monthlyPMI: data.pmi || 0,
      monthlyHOA: data.hoa || 0,
      amortizationSchedule
    };
  },

  async checkPreApproval(data: PreApprovalDto): Promise<PreApprovalResult> {
    // TODO: Implement GraphQL pre-approval check
    // For now, return a local calculation
    const monthlyPayment = this.calculateMonthlyPayment(data.loanAmount, data.interestRate, data.loanTermYears);
    const monthlyIncome = data.annualIncome / 12;
    const totalMonthlyDebt = data.monthlyDebts + monthlyPayment;
    const debtToIncomeRatio = (totalMonthlyDebt / monthlyIncome) * 100;
    
    const isApproved = debtToIncomeRatio <= 43; // Typical DTI limit
    const maxLoanAmount = (monthlyIncome * 0.28) / (data.interestRate / 100 / 12) * (1 - Math.pow(1 + data.interestRate / 100 / 12, -data.loanTermYears * 12));
    
    return {
      isApproved,
      maxLoanAmount: Math.round(maxLoanAmount),
      debtToIncomeRatio: Math.round(debtToIncomeRatio * 100) / 100,
      monthlyPayment: Math.round(monthlyPayment),
      requiredIncome: Math.round((totalMonthlyDebt / 0.43) * 12),
      message: isApproved 
        ? 'Congratulations! You may qualify for pre-approval.'
        : `Your debt-to-income ratio is ${debtToIncomeRatio.toFixed(1)}%. Consider reducing debt or increasing income.`
    };
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