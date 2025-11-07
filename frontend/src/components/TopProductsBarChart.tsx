import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import styles from './TopProductsBarChart.module.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TopProduct {
  name: string;
  total_quantity: number;
  total_revenue: number;
}

const TopProductsBarChart = () => {
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('[TopProductsBarChart] Fetching with token:', token ? 'exists' : 'missing');
        
        const response = await fetch('http://localhost:5000/api/billing/stats/summary', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('[TopProductsBarChart] Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[TopProductsBarChart] Received data:', data);
          console.log('[TopProductsBarChart] Top products array:', data.top_products);
          
          if (data.top_products && data.top_products.length > 0) {
            setTopProducts(data.top_products.slice(0, 5)); // Get top 5 products
            console.log('[TopProductsBarChart] Set top products:', data.top_products.slice(0, 5));
          } else {
            console.warn('[TopProductsBarChart] No top_products data in response');
          }
        } else {
          console.error('[TopProductsBarChart] Response not OK:', response.status);
        }
      } catch (error) {
        console.error('[TopProductsBarChart] Error fetching top products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  if (loading) {
    return <div style={{ color: '#cbd5e1', padding: '20px', textAlign: 'center' }}>Loading top products...</div>;
  }

  if (topProducts.length === 0) {
    return <div style={{ color: '#cbd5e1', padding: '20px', textAlign: 'center' }}>No product sales data available</div>;
  }

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const borderColors = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed'];

  const data = {
    labels: topProducts.map(p => p.name),
    datasets: [
      {
        label: 'Units Sold',
        data: topProducts.map(p => p.total_quantity),
        backgroundColor: colors.slice(0, topProducts.length),
        borderColor: borderColors.slice(0, topProducts.length),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1a1f2e',
        titleColor: '#ffffff',
        bodyColor: '#cbd5e1',
        borderColor: '#2e3650',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y} units sold`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#2e3650',
        },
        ticks: {
          color: '#cbd5e1',
          font: {
            size: 12,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#cbd5e1',
          font: {
            size: 12,
          },
          maxRotation: 45,
        },
      },
    },
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Top Products</h2>
      <div className={styles.chartWrapper}>
        <Bar data={data} options={options} />
      </div>
      
      <div className={styles.productList}>
        {data.labels.map((product, idx) => (
          <div key={product} className={styles.productItem}>
            <span 
              className={styles.productColor}
              style={{ backgroundColor: data.datasets[0].backgroundColor[idx] }}
            />
            <span className={styles.productName}>{product}</span>
            <span className={styles.productSales}>{data.datasets[0].data[idx]} units</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProductsBarChart;
