import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './pages/DashBoard';
import LocationPage from './pages/LocationPage';
import TrendingPage from './pages/TrendingPage';
import BillingPage from './pages/BillingPage';
import ProductsPage from './pages/ProductsPage';
import Login from './components/Login';
import Navigation from './components/Navigation';

const AppContent: React.FC = () => {
  const { user, isLoading, isManager } = useAuth();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div>
      <Navigation />
      <Routes>
        {/* Cashiers only have access to Billing */}
        {!isManager && (
          <>
            <Route path="/billing" element={<BillingPage />} />
            {/* Redirect all other routes to billing for cashiers */}
            <Route path="*" element={<BillingPage />} />
          </>
        )}
        
        {/* Managers have access to all pages */}
        {isManager && (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/location" element={<LocationPage />} />
            <Route path="/trending" element={<TrendingPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/products" element={<ProductsPage />} />
            {/* Redirect unknown routes to dashboard */}
            <Route path="*" element={<Dashboard />} />
          </>
        )}
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
