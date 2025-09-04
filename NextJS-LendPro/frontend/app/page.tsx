import Link from 'next/link';
import { Navbar } from '@/components/layouts/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Search, TrendingUp, FileText, Shield } from 'lucide-react';

const features = [
  {
    title: 'Advanced Mortgage Calculator',
    description: 'Calculate monthly payments, amortization schedules, and compare different loan scenarios.',
    icon: Calculator,
    href: '/mortgage-tools'
  },
  {
    title: 'Property Search',
    description: 'Find your dream home with advanced filtering and favorite properties management.',
    icon: Search,
    href: '/search'
  },
  {
    title: 'Market Trends',
    description: 'Stay informed with real-time market data and housing trend analysis.',
    icon: TrendingUp,
    href: '/market-trends'
  },
  {
    title: 'Loan Application',
    description: 'Apply for a mortgage with our streamlined multi-step application process.',
    icon: FileText,
    href: '/loan-application'
  }
];


export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Mortgage Journey
              <br />
              <span className="text-blue-200">Starts Here</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Discover the perfect home loan with our advanced calculators, 
              comprehensive property search, and expert mortgage guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/mortgage-tools">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Calculate Mortgage
                </Button>
              </Link>
              <Link href="/search">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Search Properties
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Your Mortgage
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From calculations to applications, we provide all the tools and resources 
              to make your mortgage journey smooth and transparent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <Link href={feature.href}>
                      <Button variant="outline" size="sm" className="w-full">
                        Explore
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">LendPro</h3>
              <p className="text-gray-600">
                Your trusted mortgage partner, providing expert guidance and innovative tools 
                for your home financing journey.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Tools</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/mortgage-tools" className="hover:text-blue-600">Mortgage Calculator</Link></li>
                <li><Link href="/mortgage-tools" className="hover:text-blue-600">Extra Payment Calculator</Link></li>
                <li><Link href="/mortgage-tools" className="hover:text-blue-600">Refinance Calculator</Link></li>
                <li><Link href="/mortgage-tools" className="hover:text-blue-600">Rent vs Buy Calculator</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Services</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/search" className="hover:text-blue-600">Property Search</Link></li>
                <li><Link href="/market-trends" className="hover:text-blue-600">Market Trends</Link></li>
                <li><Link href="/loan-application" className="hover:text-blue-600">Loan Application</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/about" className="hover:text-blue-600">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-blue-600">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>&copy; 2024 LendPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}