import { useState } from 'react';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import Academy from './pages/Academy';
import RevenueHub from './pages/RevenueHub';
import FinancialPlanner from './pages/FinancialPlanner';
import Portfolio from './pages/Portfolio';
import Onboarding from './pages/Onboarding';
import Navigation, { Page as NavPage } from './components/Navigation';
import './styles/App.css';

type Page = 'home' | 'onboarding' | NavPage;

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(
    () => localStorage.getItem('upliftWealthOnboarding') !== null
  );

  const handleLogin = () => {
    setIsAuthenticated(true);
    if (!hasCompletedOnboarding) {
      setCurrentPage('onboarding');
    } else {
      setCurrentPage('dashboard');
    }
  };

  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true);
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    if (!isAuthenticated && currentPage !== 'home') {
      return <HomePage onGetStarted={handleLogin} />;
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onGetStarted={handleLogin} />;
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
        return <Portfolio />;
      default:
        return <HomePage onGetStarted={handleLogin} />;
    }
  };

  return (
    <div className="app">
      {isAuthenticated && currentPage !== 'onboarding' && (
        <Navigation currentPage={currentPage as NavPage} onNavigate={handleNavigate} />
      )}
      <main className={`main-content${isAuthenticated && currentPage !== 'onboarding' ? ' with-nav' : ''}`}>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
