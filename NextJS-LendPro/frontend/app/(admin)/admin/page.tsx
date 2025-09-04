'use client';

import { useState, useMemo } from 'react';
import { Navbar } from '@/components/layouts/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { formatCurrency, formatPercent } from '@/lib/utils/mortgage-utils';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  UserCheck,
  UserX,
  CreditCard,
  Home,
  Calendar
} from 'lucide-react';

// Mock data for admin dashboard
const mockAdminData = {
  overview: {
    totalApplications: 1247,
    applicationsThisMonth: 89,
    pendingReview: 23,
    approvedApplications: 892,
    rejectedApplications: 332,
    totalUsers: 3456,
    activeUsers: 1234,
    totalLoanVolume: 245600000,
    averageLoanAmount: 385000
  },
  recentApplications: [
    {
      id: 'APP-2024-001',
      applicantName: 'John Smith',
      email: 'john.smith@email.com',
      loanAmount: 450000,
      loanType: '30-Year Fixed',
      status: 'pending',
      submittedDate: '2024-08-25',
      creditScore: 750,
      dti: 28,
      property: '123 Main St, Austin, TX'
    },
    {
      id: 'APP-2024-002',
      applicantName: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      loanAmount: 325000,
      loanType: '15-Year Fixed',
      status: 'approved',
      submittedDate: '2024-08-24',
      creditScore: 780,
      dti: 22,
      property: '456 Oak Ave, Dallas, TX'
    },
    {
      id: 'APP-2024-003',
      applicantName: 'Mike Chen',
      email: 'mike.chen@email.com',
      loanAmount: 550000,
      loanType: '30-Year ARM',
      status: 'under_review',
      submittedDate: '2024-08-23',
      creditScore: 720,
      dti: 35,
      property: '789 Pine Rd, Houston, TX'
    },
    {
      id: 'APP-2024-004',
      applicantName: 'Lisa Davis',
      email: 'lisa.d@email.com',
      loanAmount: 275000,
      loanType: '30-Year Fixed',
      status: 'rejected',
      submittedDate: '2024-08-22',
      creditScore: 650,
      dti: 42,
      property: '321 Elm St, San Antonio, TX'
    },
    {
      id: 'APP-2024-005',
      applicantName: 'Robert Wilson',
      email: 'rob.wilson@email.com',
      loanAmount: 420000,
      loanType: '30-Year Fixed',
      status: 'pending',
      submittedDate: '2024-08-21',
      creditScore: 705,
      dti: 31,
      property: '654 Cedar Ln, Austin, TX'
    }
  ],
  users: [
    {
      id: 'USR-001',
      name: 'John Smith',
      email: 'john.smith@email.com',
      joinDate: '2024-01-15',
      status: 'active',
      applications: 3,
      lastLogin: '2024-08-25'
    },
    {
      id: 'USR-002',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      joinDate: '2024-02-10',
      status: 'active',
      applications: 2,
      lastLogin: '2024-08-24'
    },
    {
      id: 'USR-003',
      name: 'Mike Chen',
      email: 'mike.chen@email.com',
      joinDate: '2024-03-05',
      status: 'inactive',
      applications: 1,
      lastLogin: '2024-07-15'
    }
  ]
};

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
];

const loanTypeOptions = [
  { value: 'all', label: 'All Loan Types' },
  { value: '30-Year Fixed', label: '30-Year Fixed' },
  { value: '15-Year Fixed', label: '15-Year Fixed' },
  { value: '30-Year ARM', label: '30-Year ARM' }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'users'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loanTypeFilter, setLoanTypeFilter] = useState('all');

  const { overview, recentApplications, users } = mockAdminData;

  const filteredApplications = useMemo(() => {
    return recentApplications.filter(app => {
      const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesLoanType = loanTypeFilter === 'all' || app.loanType === loanTypeFilter;
      
      return matchesSearch && matchesStatus && matchesLoanType;
    });
  }, [searchTerm, statusFilter, loanTypeFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'under_review':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'under_review':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'pending':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Manage loan applications, users, and system overview
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'applications', label: 'Loan Applications', icon: FileText },
              { id: 'users', label: 'User Management', icon: Users }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Applications</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {overview.totalApplications.toLocaleString()}
                        </p>
                        <p className="text-sm text-green-600">
                          +{overview.applicationsThisMonth} this month
                        </p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-full">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending Review</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {overview.pendingReview}
                        </p>
                        <p className="text-sm text-yellow-600">
                          Requires attention
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-100 rounded-full">
                        <AlertCircle className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {overview.totalUsers.toLocaleString()}
                        </p>
                        <p className="text-sm text-green-600">
                          {overview.activeUsers} active
                        </p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-full">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Loan Volume</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(overview.totalLoanVolume)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Avg: {formatCurrency(overview.averageLoanAmount)}
                        </p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-full">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Application Status Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Application Status Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Approved</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{overview.approvedApplications}</span>
                          <span className="text-sm text-gray-600 ml-2">
                            ({((overview.approvedApplications / overview.totalApplications) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm">Rejected</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{overview.rejectedApplications}</span>
                          <span className="text-sm text-gray-600 ml-2">
                            ({((overview.rejectedApplications / overview.totalApplications) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">Pending/Review</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">
                            {overview.totalApplications - overview.approvedApplications - overview.rejectedApplications}
                          </span>
                          <span className="text-sm text-gray-600 ml-2">
                            ({(((overview.totalApplications - overview.approvedApplications - overview.rejectedApplications) / overview.totalApplications) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full justify-start" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Review Pending Applications
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Monthly Report
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Users className="h-4 w-4 mr-2" />
                        Manage User Accounts
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        View Application Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="space-y-6">
              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search applications by name, email, or ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select
                      value={statusFilter}
                      onChange={(value) => setStatusFilter(value)}
                      options={statusOptions}
                    />
                    <Select
                      value={loanTypeFilter}
                      onChange={(value) => setLoanTypeFilter(value)}
                      options={loanTypeOptions}
                    />
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Applications Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Loan Applications ({filteredApplications.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Application ID</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Applicant</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Loan Details</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Credit Info</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredApplications.map((app, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="font-medium text-blue-600">{app.id}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium text-gray-900">{app.applicantName}</div>
                                <div className="text-sm text-gray-600">{app.email}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium">{formatCurrency(app.loanAmount)}</div>
                                <div className="text-sm text-gray-600">{app.loanType}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <div className="text-sm">Score: {app.creditScore}</div>
                                <div className="text-sm text-gray-600">DTI: {app.dti}%</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={getStatusBadge(app.status)}>
                                {formatStatus(app.status)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {new Date(app.submittedDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* User Management Table */}
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">User ID</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Join Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Applications</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Last Login</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-blue-600">{user.id}</td>
                            <td className="py-3 px-4 font-medium text-gray-900">{user.name}</td>
                            <td className="py-3 px-4 text-gray-600">{user.email}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {new Date(user.joinDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-center">{user.applications}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                user.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {new Date(user.lastLogin).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  {user.status === 'active' ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}