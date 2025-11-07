import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { managerSettingsAPI } from '../utils/api';
import styles from './Login.module.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  // Check if username is a manager account
  const isManagerUsername = username.toLowerCase() === 'admin' || username.toLowerCase().includes('manager');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate email for managers
    if (isManagerUsername && !email) {
      setError('Please enter your email address');
      return;
    }

    if (isManagerUsername && email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await login(username, password);
      
      // If user is a manager, save their email
      if (response?.user?.role === 'manager' && email) {
        try {
          await managerSettingsAPI.saveSettings(email, true);
        } catch (error) {
          console.error('Failed to save email:', error);
          // Continue anyway, email can be configured later
        }
      }
      
      // Login successful, AuthContext will handle redirect
    } catch (error: any) {
      setError(error.message || 'Login failed');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: 'user' | 'manager') => {
    if (role === 'manager') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('cashier1');
      setPassword('cashier123');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h2 className={styles.title}>Retail KPI Login</h2>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {isManagerUsername && (
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email Address (for stock alerts)</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                disabled={isLoading}
              />
              <small className={styles.hint}>
                Enter any valid email - you'll receive low stock alerts when products fall below 10 units
              </small>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <button 
            type="submit" 
            className={styles.loginButton}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className={styles.demoSection}>
          <p>Demo Accounts:</p>
          <div className={styles.demoButtons}>
            <button 
              type="button"
              onClick={() => handleDemoLogin('manager')}
              className={`${styles.demoButton} ${styles.manager}`}
              disabled={isLoading}
            >
              Manager Demo
            </button>
            <button 
              type="button"
              onClick={() => handleDemoLogin('user')}
              className={`${styles.demoButton} ${styles.user}`}
              disabled={isLoading}
            >
              Cashier Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
