import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';
import { LoanApplicationFormData } from '@/lib/schemas/loan-application.schema';

// GraphQL Mutations
const CREATE_LOAN_APPLICATION_MUTATION = gql`
  mutation CreateLoanApplication($input: CreateLoanApplicationInput!) {
    createLoanApplication(input: $input) {
      loanApplication {
        id
        loanAmount
        propertyValue
        downPayment
        interestRate
        loanTermYears
        annualIncome
        employmentStatus
        employer
        status
        notes
        createdAt
        updatedAt
      }
      errors {
        message
        code
      }
    }
  }
`;

const GET_MY_LOAN_APPLICATIONS_QUERY = gql`
  query GetMyLoanApplications($first: Int = 10) {
    myLoanApplications(first: $first) {
      id
      loanAmount
      propertyValue
      downPayment
      interestRate
      loanTermYears
      annualIncome
      employmentStatus
      employer
      status
      notes
      createdAt
      updatedAt
      documents {
        id
        fileName
        documentType
        uploadedAt
        fileSize
      }
    }
  }
`;

const GET_LOAN_APPLICATION_BY_ID_QUERY = gql`
  query GetLoanApplicationById($id: Int!) {
    loanApplication(id: $id) {
      id
      loanAmount
      propertyValue
      downPayment
      interestRate
      loanTermYears
      annualIncome
      employmentStatus
      employer
      status
      notes
      createdAt
      updatedAt
      documents {
        id
        fileName
        documentType
        uploadedAt
        fileSize
      }
      payments {
        id
        amount
        paymentDate
        status
      }
    }
  }
`;

const UPLOAD_DOCUMENT_MUTATION = gql`
  mutation UploadLoanDocument($input: UploadDocumentInput!) {
    uploadLoanDocument(input: $input) {
      document {
        id
        fileName
        documentType
        uploadedAt
        fileSize
      }
      errors {
        message
        code
      }
    }
  }
`;

export interface LoanApplication {
  id: number;
  userId: string;
  loanAmount: number;
  propertyValue: number;
  downPayment: number;
  interestRate: number;
  loanTermYears: number;
  annualIncome: number;
  monthlyDebts?: number;
  employmentStatus: string;
  employer?: string;
  status: 'Pending' | 'UnderReview' | 'Approved' | 'Rejected' | 'Withdrawn';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  documents?: Document[];
}

export interface Document {
  id: number;
  fileName: string;
  documentType: string;
  uploadedAt: string;
  fileSize: number;
}

// Transform the complex form data to the simple GraphQL input
function transformFormDataToGraphQLInput(formData: LoanApplicationFormData) {
  // Calculate the total annual income from all sources
  let totalAnnualIncome = formData.financialInfo.annualIncome;
  
  // Add additional income sources if any
  if (formData.employmentInfo.additionalIncome) {
    formData.employmentInfo.additionalIncome.forEach(income => {
      if (income.frequency === 'monthly') {
        totalAnnualIncome += income.amount * 12;
      } else if (income.frequency === 'quarterly') {
        totalAnnualIncome += income.amount * 4;
      } else if (income.frequency === 'annually') {
        totalAnnualIncome += income.amount;
      }
    });
  }

  return {
    loanAmount: formData.loanDetails.loanAmount,
    propertyValue: formData.loanDetails.propertyValue,
    downPayment: formData.loanDetails.downPayment,
    interestRate: formData.loanDetails.interestRate,
    loanTermYears: formData.loanDetails.loanTermYears,
    annualIncome: totalAnnualIncome,
    employmentStatus: formData.employmentInfo.employmentStatus,
    employer: formData.employmentInfo.currentEmployment?.employer || null,
    notes: `Property: ${formData.propertyInfo.address.street}, ${formData.propertyInfo.address.city}, ${formData.propertyInfo.address.state} ${formData.propertyInfo.address.zipCode}
Applicant: ${formData.personalInfo.firstName} ${formData.personalInfo.lastName}
Contact: ${formData.personalInfo.email} | ${formData.personalInfo.phone}`
  };
}

export const loanService = {
  async createApplication(formData: LoanApplicationFormData): Promise<LoanApplication> {
    try {
      // Transform the complex form data to match the backend's simpler structure
      const input = transformFormDataToGraphQLInput(formData);
      
      const { data } = await apolloClient.mutate({
        mutation: CREATE_LOAN_APPLICATION_MUTATION,
        variables: { input },
        refetchQueries: [{ query: GET_MY_LOAN_APPLICATIONS_QUERY }]
      });

      if (data.createLoanApplication.errors?.length > 0) {
        throw new Error(data.createLoanApplication.errors[0].message);
      }

      return data.createLoanApplication.loanApplication;
    } catch (error: any) {
      console.error('Error creating loan application:', error);
      throw new Error(error.message || 'Failed to submit loan application');
    }
  },

  async getMyApplications(): Promise<LoanApplication[]> {
    try {
      const { data } = await apolloClient.query({
        query: GET_MY_LOAN_APPLICATIONS_QUERY,
        fetchPolicy: 'network-only'
      });

      return data.myLoanApplications || [];
    } catch (error: any) {
      console.error('Error fetching loan applications:', error);
      return [];
    }
  },

  async getApplicationById(id: number): Promise<LoanApplication | null> {
    try {
      const { data } = await apolloClient.query({
        query: GET_LOAN_APPLICATION_BY_ID_QUERY,
        variables: { id },
        fetchPolicy: 'network-only'
      });

      return data.loanApplication;
    } catch (error: any) {
      console.error('Error fetching loan application:', error);
      return null;
    }
  },

  async uploadDocument(applicationId: number, file: File, documentType: string): Promise<Document> {
    try {
      // Convert file to base64
      const fileData = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });

      const uint8Array = new Uint8Array(fileData);
      const base64 = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));

      const { data } = await apolloClient.mutate({
        mutation: UPLOAD_DOCUMENT_MUTATION,
        variables: {
          input: {
            loanApplicationId: applicationId,
            documentType,
            fileName: file.name,
            fileData: Array.from(uint8Array),
            fileSize: file.size
          }
        }
      });

      if (data.uploadLoanDocument.errors?.length > 0) {
        throw new Error(data.uploadLoanDocument.errors[0].message);
      }

      return data.uploadLoanDocument.document;
    } catch (error: any) {
      console.error('Error uploading document:', error);
      throw new Error(error.message || 'Failed to upload document');
    }
  }
};