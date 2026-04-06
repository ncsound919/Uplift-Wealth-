import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import Academy from './pages/Academy';
import RevenueHub from './pages/RevenueHub';
import FinancialPlanner from './pages/FinancialPlanner';
import PortfolioEnhanced from './pages/PortfolioEnhanced';
import WealthStrategies from './pages/WealthStrategies';
import Onboarding from './pages/Onboarding';
import LoginPage from './pages/LoginPage';
import Navigation, { Page as NavPage } from './components/Navigation';
import './styles/App.css';

type Page = 'home' | 'login' | 'onboarding' | 'strategies' | NavPage;

function AppContent() {
  const { currentUser, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(
    () => localStorage.getItem('upliftWealthOnboarding') !== null
  );

  const handleLoginSuccess = () => {
    if (!hasCompletedOnboarding) {
      setCurrentPage('onboarding');
    } else {
      setCurrentPage('dashboard');
    }
  };

  const handleGetStarted = () => {
    setCurrentPage('login');
  };

  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true);
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  const handleLogout = async () => {
    await logout();
    setCurrentPage('home');
  };

  const renderPage = () => {
    if (!currentUser && currentPage !== 'home' && currentPage !== 'login') {
      return <HomePage onGetStarted={handleGetStarted} />;
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onGetStarted={handleGetStarted} />;
      case 'login':
        return <LoginPage onSuccess={handleLoginSuccess} />;
      case 'onboarding':
        return <Onboarding onComplete={handleOnboardingComplete} />;
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'academy':
        return <Academy />;
      case 'revenue':
        return <RevenueHub />;
      case 'planner':
        return <FinancialPlanner />;
      case 'portfolio':
        return <PortfolioEnhanced />;
      case 'strategies':
        return <WealthStrategies />;
      default:
        return <HomePage onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <div className="app">
      {currentUser && currentPage !== 'onboarding' && currentPage !== 'login' && (
        <Navigation currentPage={currentPage as NavPage} onNavigate={handleNavigate} />
      )}
      <main className={`main-content${currentUser && currentPage !== 'onboarding' && currentPage !== 'login' ? ' with-nav' : ''}`}>
        {renderPage()}
      </main>
      {currentUser && currentPage !== 'login' && (
        <button
          onClick={handleLogout}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '12px 20px',
            background: 'var(--danger-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000
          }}
        >
          Logout
        </button>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
