import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const cards = [
    {
      icon: '📝',
      title: 'Offer Letter',
      description: 'Create professional job offer letters',
      link: '/offer-letter',
      tags: ['PDF Export']
    },
    {
      icon: '📋',
      title: 'Appointment Letter',
      description: 'Generate appointment letters for new employees',
      link: '/appointment-letter',
      tags: ['PDF Export']
    },
    {
      icon: '📈',
      title: 'Increment Letter',
      description: 'Create salary increment letters',
      link: '/increment-letter',
      tags: ['PDF Export']
    },
    {
      icon: '👋',
      title: 'Relieving Letter',
      description: 'Generate relieving letters for employees',
      link: '/relieving-letter',
      tags: ['PDF Export']
    },
    {
      icon: '⚠️',
      title: 'Termination Letter',
      description: 'Create termination letters',
      link: '/termination-letter',
      tags: ['PDF Export']
    },
    {
      icon: '💰',
      title: 'Salary Slip',
      description: 'Generate professional salary slips',
      link: '/salary-slip',
      tags: ['Auto Calculate']
    },
    {
      icon: '🏢',
      title: 'Org Hierarchy',
      description: 'Manage organizational structure and reporting',
      link: '/hierarchy',
      tags: ['Visual Chart']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <div className="flex justify-end mb-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <span className="text-white text-sm">
                    {user?.email}
                  </span>
                  <Link
                    to="/hierarchy"
                    className="bg-white text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors text-sm font-semibold"
                  >
                    My Hierarchy
                  </Link>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    className="bg-white text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors text-sm font-semibold"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary-700 text-white px-4 py-2 rounded-lg hover:bg-primary-800 transition-colors text-sm font-semibold"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              📄 Document Generator
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              Generate professional documents for multiple companies
            </p>
            {isAuthenticated && (
              <p className="text-lg text-green-200 mt-2">
                ✓ Your data is synced to the cloud
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => (
              <Link key={index} to={card.link} className="group">
                <div className="card hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer h-full">
                  <div className="text-center">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {card.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{card.title}</h2>
                    <p className="text-gray-600 mb-6 text-sm">{card.description}</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {card.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-white/80 text-sm">
              {isAuthenticated 
                ? 'No installation required • Runs in your browser • Data synced to cloud'
                : 'No installation required • Runs in your browser • Register to save data in cloud'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

