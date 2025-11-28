import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';

const Landing = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: '📄',
      title: 'Document Generation',
      description: 'Create professional HR documents with ease',
      items: ['Offer Letters', 'Appointment Letters', 'Salary Slips', 'Increment Letters', 'Relieving Letters', 'Termination Letters']
    },
    {
      icon: '🏢',
      title: 'Org Hierarchy',
      description: 'Visualize and manage your organizational structure',
      items: ['Interactive Charts', 'Cloud Sync', 'Export Options', 'Multi-level Management']
    },
    {
      icon: '☁️',
      title: 'Cloud Storage',
      description: 'Your data is safe and accessible anywhere',
      items: ['Auto Sync', 'Secure Storage', 'Multi-device Access', 'Backup & Restore']
    }
  ];

  const documentTypes = [
    { name: 'Offer Letter', icon: '📝', path: '/offer-letter', color: 'from-blue-500 to-blue-600' },
    { name: 'Appointment Letter', icon: '📋', path: '/appointment-letter', color: 'from-green-500 to-green-600' },
    { name: 'Increment Letter', icon: '📈', path: '/increment-letter', color: 'from-purple-500 to-purple-600' },
    { name: 'Relieving Letter', icon: '👋', path: '/relieving-letter', color: 'from-orange-500 to-orange-600' },
    { name: 'Termination Letter', icon: '⚠️', path: '/termination-letter', color: 'from-red-500 to-red-600' },
    { name: 'Salary Slip', icon: '💰', path: '/salary-slip', color: 'from-yellow-500 to-yellow-600' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Welcome to GrandHR
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-white/90 max-w-3xl mx-auto">
            Complete HR solution for <strong>Employers</strong> and <strong>Employees</strong>
          </p>
          <p className="text-lg mb-8 text-white/80 max-w-2xl mx-auto">
            Generate professional documents, manage organizational hierarchy, track attendance, manage leaves, and access payroll - all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/offer-letter"
              className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              📄 Generate Documents (Free)
            </Link>
            <Link
              to="/hr/login"
              className="px-8 py-4 bg-primary-700 text-white rounded-lg font-semibold text-lg hover:bg-primary-800 transition-colors shadow-lg border-2 border-white/20"
            >
              👔 HR Management Login
            </Link>
          </div>
          {!isAuthenticated && (
            <div className="text-sm text-white/70">
              <Link to="/register" className="underline hover:text-white">Register for Hierarchy Management</Link>
              {' • '}
              <Link to="/hr/login" className="underline hover:text-white">Login as Employee/Employer</Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-gray-700">
                      <span className="text-primary-600 mr-2">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HR Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
            Complete HR Management
          </h2>
          <p className="text-center text-gray-600 mb-4 max-w-2xl mx-auto">
            For <strong>Employers</strong>: Manage your entire workforce, approve leaves, track attendance, and process payroll.
          </p>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            For <strong>Employees</strong>: View your profile, apply for leaves, clock in/out, and access your payslips.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/hr/dashboard" className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary-500 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary-600 transition-colors">Dashboard</h3>
              <p className="text-gray-600 text-sm mt-2">View HR analytics and insights</p>
            </Link>
            <Link to="/hr/employees" className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary-500 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary-600 transition-colors">Employees</h3>
              <p className="text-gray-600 text-sm mt-2">Manage employee information</p>
            </Link>
            <Link to="/hr/leaves" className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary-500 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary-600 transition-colors">Leaves</h3>
              <p className="text-gray-600 text-sm mt-2">Track and manage leave requests</p>
            </Link>
            <Link to="/hr/attendance" className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary-500 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="text-4xl mb-3">⏰</div>
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary-600 transition-colors">Attendance</h3>
              <p className="text-gray-600 text-sm mt-2">Clock in/out and track hours</p>
            </Link>
            <Link to="/hr/payroll" className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary-500 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary-600 transition-colors">Payroll</h3>
              <p className="text-gray-600 text-sm mt-2">View salary and payslips</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Document Types Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4">
            <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-4">
              ✨ Free to Use - No Login Required
            </span>
            <h2 className="text-4xl font-bold text-gray-800">
              Generate Professional Documents
            </h2>
          </div>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Anyone can create professional HR documents instantly. Export to PDF, customize templates, and maintain consistency. Perfect for employers, employees, and HR professionals.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentTypes.map((doc, index) => (
              <Link
                key={index}
                to={doc.path}
                className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary-500 hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="flex items-center space-x-4">
                  <div className={`text-4xl bg-gradient-to-r ${doc.color} p-3 rounded-lg`}>
                    {doc.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary-600 transition-colors">
                    {doc.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to streamline your HR processes?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of companies using GrandHR to manage their HR documentation
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Start Free Today
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="text-2xl font-bold mb-2">GrandHR</div>
          <p className="text-gray-400 text-sm">
            Professional HR Management Solution
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

