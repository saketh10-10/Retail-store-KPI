import React, { useState, useEffect, useCallback } from 'react';
import { trendingAPI } from '../utils/api';
import styles from './DashBoard.module.css';

interface TrendingProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category: string;
  sku: string;
  total_sold?: number;
  total_revenue?: number;
  sales_per_day?: string;
}

interface TrendingResponse {
  filter: string;
  period_days: number;
  category: string;
  products: TrendingProduct[];
  summary: {
    total_products: number;
    total_items_sold: number;
    total_revenue: number;
  };
}

const TrendingPage: React.FC = () => {
  const [trendingData, setTrendingData] = useState<TrendingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('most_purchased');
  const [days, setDays] = useState<number>(30);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await trendingAPI.getCategories();
      setCategories(response.categories.map((c: any) => c.category));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  const fetchTrendingProducts = useCallback(async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const params: any = {
        filter,
        days,
        limit: 10,
      };
      
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      
      const response = await trendingAPI.getTrending(params);
      setTrendingData(response);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch trending products');
    } finally {
      setIsLoading(false);
    }
  }, [filter, days, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchTrendingProducts();
  }, [fetchTrendingProducts]);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const getFilterLabel = (filterType: string) => {
    const labels: { [key: string]: string } = {
      most_purchased: 'Most Purchased',
      fastest_selling: 'Fastest Selling',
      highest_revenue: 'Highest Revenue',
      recently_added: 'Recently Added',
    };
    return labels[filterType] || filterType;
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>🔥 Trending Products</h1>
          <p>Discover what's popular in your store</p>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Filter By:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="most_purchased">Most Purchased</option>
            <option value="fastest_selling">Fastest Selling</option>
            <option value="highest_revenue">Highest Revenue</option>
            <option value="recently_added">Recently Added</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Time Period:</label>
          <select 
            value={days} 
            onChange={(e) => setDays(Number(e.target.value))}
            className={styles.filterSelect}
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={60}>Last 60 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Category:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {trendingData && (
        <div className={styles.summary}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>📦</div>
            <div className={styles.summaryContent}>
              <div className={styles.summaryValue}>{trendingData.summary.total_products}</div>
              <div className={styles.summaryLabel}>Products</div>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>🛒</div>
            <div className={styles.summaryContent}>
              <div className={styles.summaryValue}>{trendingData.summary.total_items_sold}</div>
              <div className={styles.summaryLabel}>Items Sold</div>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>💰</div>
            <div className={styles.summaryContent}>
              <div className={styles.summaryValue}>{formatCurrency(trendingData.summary.total_revenue)}</div>
              <div className={styles.summaryLabel}>Revenue</div>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading trending products...</p>
        </div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : trendingData && trendingData.products.length > 0 ? (
        <div className={styles.productsSection}>
          <h2>{getFilterLabel(filter)} - Last {days} Days</h2>
          <div className={styles.productsList}>
            {trendingData.products.map((product, index) => (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.productRank}>#{index + 1}</div>
                <div className={styles.productInfo}>
                  <div className={styles.productHeader}>
                    <h3>{product.name}</h3>
                    <span className={styles.productCategory}>{product.category}</span>
                  </div>
                  <p className={styles.productDescription}>{product.description}</p>
                  <div className={styles.productDetails}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Price:</span>
                      <span className={styles.detailValue}>{formatCurrency(product.price)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Stock:</span>
                      <span className={`${styles.detailValue} ${product.stock_quantity < 20 ? styles.lowStock : ''}`}>
                        {product.stock_quantity} units
                      </span>
                    </div>
                    {product.total_sold !== undefined && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Sold:</span>
                        <span className={styles.detailValue}>{product.total_sold} units</span>
                      </div>
                    )}
                    {product.total_revenue !== undefined && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Revenue:</span>
                        <span className={styles.detailValue}>{formatCurrency(product.total_revenue)}</span>
                      </div>
                    )}
                    {product.sales_per_day && filter === 'fastest_selling' && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Sales/Day:</span>
                        <span className={styles.detailValue}>{product.sales_per_day}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.noData}>
          <p>No trending data available for the selected filters.</p>
          <p>Create some billing transactions to see trending products!</p>
        </div>
      )}
    </div>
  );
};

export default TrendingPage;
