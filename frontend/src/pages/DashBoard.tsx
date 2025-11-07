import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DashBoard.module.css';
import StatsCard from '../components/StatsCard';
import SalesTrendChart from '../components/SalesTrendChart';
import TopProductsBarChart from '../components/TopProductsBarChart';

interface StatsData {
  total_revenue: number;
  total_bills: number;
  completed_bills: number;
  pending_bills: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Fetching stats with token:', token ? 'Token exists' : 'No token');
        
        const response = await fetch('http://localhost:5000/api/billing/stats/summary', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Received data:', data);
          setStats(data.summary);
        } else {
          console.error('Response not OK:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('Error details:', errorText);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const avgTransaction = stats && stats.completed_bills > 0 
    ? stats.total_revenue / stats.completed_bills 
    : 0;

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>📊 KP Retail Store Dashboard</h1>
        <div className={styles.navButtons}>
          <button onClick={() => navigate('/location')}>
            📍 Location Intelligence
          </button>
        </div>
      </header>

      <section className={styles.stats}>
        <StatsCard 
          label="Total Sales" 
          value={loading ? "Loading..." : formatCurrency(stats?.total_revenue || 0)} 
          icon="💰" 
        />
        <StatsCard 
          label="Transactions" 
          value={loading ? "Loading..." : String(stats?.total_bills || 0)} 
          icon="📄" 
        />
        <StatsCard 
          label="Avg Transaction" 
          value={loading ? "Loading..." : formatCurrency(avgTransaction)} 
          icon="📊" 
        />
        <StatsCard 
          label="Completed Bills" 
          value={loading ? "Loading..." : String(stats?.completed_bills || 0)} 
          icon="✅" 
        />
        <StatsCard 
          label="Pending Bills" 
          value={loading ? "Loading..." : String(stats?.pending_bills || 0)} 
          icon="⏳" 
        />
        <StatsCard 
          label="Success Rate" 
          value={loading ? "Loading..." : stats && stats.total_bills > 0 ? `${((stats.completed_bills / stats.total_bills) * 100).toFixed(1)}%` : "0%"} 
          icon="📈" 
        />
      </section>

      <section className={styles.chartSection}>
        <div className={styles.salesTrend}>
          <h2>📈 Daily Sales Trend</h2>
          <SalesTrendChart />
        </div>

        <div className={styles.salesByCategory}>
          <h2>🏆 Top Products</h2>
          <TopProductsBarChart />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
