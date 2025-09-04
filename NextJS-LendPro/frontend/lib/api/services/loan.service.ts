import apiClient from '../api-client';

export interface LoanApplication {
  id: number;
  userId: string;
  loanAmount: number;
  propertyValue: number;
  downPayment: number;
  interestRate: number;
  loanTermYears: number;
  annualIncome: number;
  monthlyDebts: number;
  employmentStatus: string;
  employer?: string;
  yearsEmployed?: number;
  status: 'Pending' | 'UnderReview' | 'Approved' | 'Denied' | 'Withdrawn';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  documents?: Document[];
}

export interface CreateLoanApplicationDto {
  loanAmount: number;
  propertyValue: number;
  downPayment: number;
  interestRate: number;
  loanTermYears: number;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    ssn: string;
    maritalStatus: string;
    dependents: number;
  };
  employmentInfo: {
    employmentStatus: string;
    employer?: string;
    jobTitle?: string;
    yearsEmployed?: number;
    monthlyIncome: number;
  };
  financialInfo: {
    annualIncome: number;
    monthlyDebts: number;
    assets: {
      checking: number;
      savings: number;
      investments: number;
      retirement: number;
    };
    liabilities: {
      creditCards: number;
      autoLoans: number;
      studentLoans: number;
      otherDebts: number;
    };
  };
  propertyInfo: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    propertyType: string;
    occupancyType: string;
  };
  references: {
    personal: Array<{
      name: string;
      relationship: string;
      phone: string;
      email: string;
    }>;
    professional?: Array<{
      name: string;
      title: string;
      company: string;
      phone: string;
      email: string;
    }>;
  };
}

export interface Document {
  id: number;
  fileName: string;
  documentType: string;
  uploadedAt: string;
  fileSize: number;
}

export const loanService = {
  async createApplication(data: CreateLoanApplicationDto): Promise<LoanApplication> {
    const response = await apiClient.post<LoanApplication>('/loans', data);
    return response.data;
  },

  async getMyApplications(): Promise<LoanApplication[]> {
    const response = await apiClient.get<LoanApplication[]>('/loans/my');
    return response.data;
  },

  async getApplicationById(id: number): Promise<LoanApplication> {
    const response = await apiClient.get<LoanApplication>(`/loans/${id}`);
    return response.data;
  },

  async updateApplicationStatus(id: number, status: string, notes?: string): Promise<void> {
    await apiClient.put(`/loans/${id}/status`, { status, notes });
  },

  async uploadDocument(applicationId: number, file: File, documentType: string): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    const response = await apiClient.post<Document>(
      `/loans/${applicationId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  }
};