import React, { useState, useEffect } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DailySalesData {
  date: string;
  revenue: number;
  bill_count: number;
}

const SalesTrendChart = () => {
  const [salesData, setSalesData] = useState<DailySalesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('[SalesTrendChart] Fetching with token:', token ? 'exists' : 'missing');
        
        const response = await fetch('http://localhost:5000/api/billing/stats/summary', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('[SalesTrendChart] Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[SalesTrendChart] Received data:', data);
          console.log('[SalesTrendChart] Daily sales array:', data.daily_sales);
          
          if (data.daily_sales && data.daily_sales.length > 0) {
            // Transform the data for the chart (reverse to show oldest first)
            const chartData = data.daily_sales.reverse().map((item: DailySalesData) => ({
              date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              sales: item.revenue || 0,
              bills: item.bill_count
            }));
            console.log('[SalesTrendChart] Chart data:', chartData);
            setSalesData(chartData);
          } else {
            console.warn('[SalesTrendChart] No daily_sales data in response');
          }
        } else {
          console.error('[SalesTrendChart] Response not OK:', response.status);
        }
      } catch (error) {
        console.error('[SalesTrendChart] Error fetching sales data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  if (loading) {
    return <div style={{ color: '#cbd5e1', padding: '20px', textAlign: 'center' }}>Loading sales data...</div>;
  }

  if (salesData.length === 0) {
    return <div style={{ color: '#cbd5e1', padding: '20px', textAlign: 'center' }}>No sales data available</div>;
  }

  return (
    <div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={salesData}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              stroke="#cbd5e1"
              fontSize={12}
            />
            <YAxis 
              stroke="#cbd5e1"
              fontSize={12}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(1)}k`}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div style={{
                      backgroundColor: '#1a1f2e',
                      border: '1px solid #2e3650',
                      borderRadius: '8px',
                      padding: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', margin: '0 0 4px 0' }}>
                        {payload[0].payload.month}
                      </p>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#3b82f6', margin: '0' }}>
                        ${payload[0].value?.toLocaleString()}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="sales" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fill="url(#salesGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
    </div>
  );
};

export default SalesTrendChart;