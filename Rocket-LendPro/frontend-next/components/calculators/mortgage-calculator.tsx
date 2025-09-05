'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { calculateMonthlyPayment, generateAmortizationSchedule } from '@/lib/mortgage-utils'
import { AmortizationChart } from '@/components/charts/amortization-chart'
import { apiClient } from '@/lib/apollo-client'

interface AmortizationData {
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

export function MortgageCalculator() {
  const [loanAmount, setLoanAmount] = useState('400000')
  const [interestRate, setInterestRate] = useState('6.5')
  const [loanTerm, setLoanTerm] = useState('30')
  const [downPayment, setDownPayment] = useState('80000')
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)
  const [totalPayment, setTotalPayment] = useState(0)
  const [amortizationSchedule, setAmortizationSchedule] = useState<AmortizationData[]>([])
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    const principal = parseFloat(loanAmount) - parseFloat(downPayment)
    const rate = parseFloat(interestRate)
    const term = parseInt(loanTerm)
    
    if (principal > 0 && rate > 0 && term > 0) {
      const payment = calculateMonthlyPayment(principal, rate, term)
      const total = payment * term * 12
      const interest = total - principal
      
      setMonthlyPayment(payment)
      setTotalInterest(interest)
      setTotalPayment(total)
      
      const schedule = generateAmortizationSchedule(principal, rate, term)
      setAmortizationSchedule(schedule.slice(0, 360)) // Limit to 30 years for chart
    }
  }, [loanAmount, interestRate, loanTerm, downPayment])

  const handleSaveCalculation = async () => {
    setIsCalculating(true)
    try {
      const response = await apiClient.post('/mortgage/calculate', {
        loanAmount: parseFloat(loanAmount),
        interestRate: parseFloat(interestRate),
        loanTerm: parseInt(loanTerm),
        downPayment: parseFloat(downPayment),
        monthlyPayment,
        totalInterest,
        totalPayment
      })
      
      // Save calculation to localStorage for history
      const calculations = JSON.parse(localStorage.getItem('mortgageCalculations') || '[]')
      calculations.unshift({
        id: Date.now(),
        date: new Date().toISOString(),
        loanAmount: parseFloat(loanAmount),
        downPayment: parseFloat(downPayment),
        interestRate: parseFloat(interestRate),
        loanTerm: parseInt(loanTerm),
        monthlyPayment,
        totalInterest,
        totalPayment
      })
      
      // Keep only last 10 calculations
      localStorage.setItem('mortgageCalculations', JSON.stringify(calculations.slice(0, 10)))
      
      alert('Calculation saved successfully!')
    } catch (error) {
      console.error('Error saving calculation:', error)
      alert('Error saving calculation. Please try again.')
    } finally {
      setIsCalculating(false)
    }
  }

  const calculateAffordability = () => {
    const principal = parseFloat(loanAmount) - parseFloat(downPayment)
    const payment = monthlyPayment
    
    // General rule: housing costs should not exceed 28% of gross income
    const requiredIncome = (payment / 0.28) * 12
    
    return requiredIncome
  }

  const downPaymentPercentage = ((parseFloat(downPayment) / parseFloat(loanAmount)) * 100).toFixed(1)
  const loanToValue = (100 - parseFloat(downPaymentPercentage)).toFixed(1)

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mortgage Calculator</h1>
        <p className="text-gray-600">Calculate your monthly payments and explore loan scenarios</p>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Loan Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Home Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="pl-8"
                  min="0"
                  step="1000"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Down Payment ({downPaymentPercentage}%)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                  className="pl-8"
                  min="0"
                  step="1000"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interest Rate
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="pr-8"
                  min="0"
                  max="20"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan Term
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
              >
                <option value="15">15 years</option>
                <option value="20">20 years</option>
                <option value="25">25 years</option>
                <option value="30">30 years</option>
              </select>
            </div>
            
            <Button 
              onClick={handleSaveCalculation} 
              className="w-full"
              disabled={isCalculating}
            >
              {isCalculating ? 'Saving...' : 'Save Calculation'}
            </Button>
          </div>
        </Card>
        
        {/* Results Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Payment</h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Principal & Interest</p>
              <p className="text-3xl font-bold text-blue-800">
                ${monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600">Loan Amount</p>
                <p className="font-semibold">
                  ${(parseFloat(loanAmount) - parseFloat(downPayment)).toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600">Loan-to-Value</p>
                <p className="font-semibold">{loanToValue}%</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Interest:</span>
                <span className="font-medium">
                  ${totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Payment:</span>
                <span className="font-medium">
                  ${totalPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-sm text-gray-600">Required Income:</span>
                <span className="font-medium text-green-600">
                  ${calculateAffordability().toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/year
                </span>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Chart Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Payment Breakdown</h2>
          
          {amortizationSchedule.length > 0 && (
            <AmortizationChart data={amortizationSchedule} />
          )}
          
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">First Year Interest</p>
              <p className="font-semibold text-red-600">
                ${amortizationSchedule.slice(0, 12).reduce((sum, item) => sum + item.interest, 0)
                  .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-gray-600">First Year Principal</p>
              <p className="font-semibold text-green-600">
                ${amortizationSchedule.slice(0, 12).reduce((sum, item) => sum + item.principal, 0)
                  .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}