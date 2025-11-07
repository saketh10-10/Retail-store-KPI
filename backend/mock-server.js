const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { sendExpiryAlert, sendLowStockAlert } = require('./services/emailService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // frontend origins
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock data
// IMPORTANT: Manager email addresses are set during login
// Users will enter their own email when logging in as manager
let users = [
  { id: 1, username: 'admin', email: 'admin@retailkpi.com', password: 'admin123', role: 'manager' },
  { id: 2, username: 'cashier1', email: 'cashier1@retailkpi.com', password: 'cashier123', role: 'user' },
  { id: 3, username: 'manager1', email: 'manager1@retailkpi.com', password: 'manager123', role: 'manager' }
];

// File paths for persistence
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const BILLS_FILE = path.join(__dirname, 'data', 'bills.json');

// Helper functions for file operations
const loadData = (filePath, defaultData) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error.message);
  }
  return defaultData;
};

const saveData = (filePath, data) => {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error saving ${filePath}:`, error.message);
  }
};

// Default products (only used if file is empty) - dates only for perishable items
const defaultProducts = [
  { id: 1, name: 'Soap Bar', description: 'Premium soap bar', price: 2.50, stock_quantity: 100, category: 'Personal Care', sku: 'SOAP001', min_stock_threshold: 20 },
  { id: 2, name: 'Soft Drink', description: 'Carbonated soft drink', price: 1.25, stock_quantity: 200, category: 'Beverages', sku: 'DRINK001', min_stock_threshold: 50 },
  { id: 3, name: 'Soda Water', description: 'Sparkling water', price: 1.00, stock_quantity: 150, category: 'Beverages', sku: 'SODA001', min_stock_threshold: 30 },
  { id: 4, name: 'Socks', description: 'Cotton socks', price: 5.00, stock_quantity: 50, category: 'Clothing', sku: 'SOCK001', min_stock_threshold: 15 },
  { id: 5, name: 'Sunglasses', description: 'UV protection sunglasses', price: 15.00, stock_quantity: 30, category: 'Accessories', sku: 'SUN001', min_stock_threshold: 10 },
  { id: 6, name: 'Shampoo', description: 'Hair shampoo 250ml', price: 8.50, stock_quantity: 75, category: 'Personal Care', sku: 'SHAM001', min_stock_threshold: 25 },
  { id: 7, name: 'Sandwich', description: 'Fresh sandwich', price: 4.50, stock_quantity: 25, category: 'Food', sku: 'SAND001', batch_no: 'BATCH007', manufacturing_date: '2024-10-25', expiry_date: '2024-11-05', min_stock_threshold: 10 },
  { id: 8, name: 'Milk', description: 'Fresh milk 1L', price: 3.20, stock_quantity: 120, category: 'Dairy', sku: 'MILK001', batch_no: 'BATCH008', manufacturing_date: '2024-10-20', expiry_date: '2024-11-03', min_stock_threshold: 40 },
  { id: 9, name: 'Bread', description: 'White bread loaf', price: 2.80, stock_quantity: 90, category: 'Bakery', sku: 'BREAD001', batch_no: 'BATCH009', manufacturing_date: '2024-10-24', expiry_date: '2024-11-01', min_stock_threshold: 20 },
  { id: 10, name: 'Butter', description: 'Salted butter 200g', price: 4.00, stock_quantity: 60, category: 'Dairy', sku: 'BUTT001', batch_no: 'BATCH010', manufacturing_date: '2024-09-01', expiry_date: '2025-03-01', min_stock_threshold: 15 }
];

// Load data from files or use defaults
let products = loadData(PRODUCTS_FILE, defaultProducts);
if (products.length === 0) {
  products = defaultProducts;
  saveData(PRODUCTS_FILE, products);
}

let bills = loadData(BILLS_FILE, []);
let billCounter = bills.length > 0 ? Math.max(...bills.map(b => b.id)) + 1 : 1;
let expiryNotificationsSent = new Set(); // Track which products have been notified
let lowStockNotificationsSent = new Set(); // Track which products have been notified for low stock

// Simple token generation (for demo only)
const generateToken = (user) => {
  return Buffer.from(JSON.stringify({ id: user.id, username: user.username, role: user.role })).toString('base64');
};

const verifyToken = (token) => {
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString());
  } catch {
    return null;
  }
};

// Middleware to check authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(403).json({ error: 'Invalid token' });
  }

  req.user = user;
  next();
};

const requireRole = (roles) => {
  return (req, res, next) => {
    const userRoles = Array.isArray(roles) ? roles : [roles];
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Retail KPI Mock Server is running',
    timestamp: new Date().toISOString()
  });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => 
    (u.username === username || u.email === username) && u.password === password
  );
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = generateToken(user);
  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

app.get('/api/auth/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Products endpoints
app.get('/api/products', authenticateToken, (req, res) => {
  const { search, category, page = 1, limit = 50 } = req.query;
  
  let filteredProducts = [...products];
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      (p.sku && p.sku.toLowerCase().includes(searchLower))
    );
  }
  
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  res.json({
    products: paginatedProducts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredProducts.length,
      totalPages: Math.ceil(filteredProducts.length / limit)
    }
  });
});

app.get('/api/products/autocomplete', authenticateToken, (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 1) {
    return res.json({ suggestions: [] });
  }
  
  const suggestions = products
    .filter(p => p.name.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 10)
    .map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      stock: p.stock_quantity
    }));
  
  res.json({ suggestions });
});

app.get('/api/products/meta/categories', authenticateToken, (req, res) => {
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  res.json({ categories });
});

app.post('/api/products', authenticateToken, requireRole('manager'), (req, res) => {
  const { name, description, price, stock_quantity = 0, category, sku, batch_no, manufacturing_date, expiry_date } = req.body;
  
  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }
  
  if (sku && products.find(p => p.sku === sku)) {
    return res.status(409).json({ error: 'SKU already exists' });
  }
  
  const newProduct = {
    id: Math.max(...products.map(p => p.id)) + 1,
    name,
    description: description || '',
    price: parseFloat(price),
    stock_quantity: parseInt(stock_quantity),
    category: category || '',
    sku: sku || '',
    batch_no: batch_no || '',
    manufacturing_date: manufacturing_date || null,
    expiry_date: expiry_date || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  products.push(newProduct);
  saveData(PRODUCTS_FILE, products); // Save to file
  
  res.status(201).json({
    message: 'Product created successfully',
    product: newProduct
  });
});

app.put('/api/products/:id', authenticateToken, requireRole('manager'), (req, res) => {
  const { id } = req.params;
  const productIndex = products.findIndex(p => p.id === parseInt(id));
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  const { name, description, price, stock_quantity, category, sku, batch_no, manufacturing_date, expiry_date } = req.body;
  
  if (sku && sku !== products[productIndex].sku && products.find(p => p.sku === sku)) {
    return res.status(409).json({ error: 'SKU already exists' });
  }
  
  products[productIndex] = {
    ...products[productIndex],
    ...(name && { name }),
    ...(description !== undefined && { description }),
    ...(price && { price: parseFloat(price) }),
    ...(stock_quantity !== undefined && { stock_quantity: parseInt(stock_quantity) }),
    ...(category !== undefined && { category }),
    ...(sku !== undefined && { sku }),
    ...(batch_no !== undefined && { batch_no }),
    ...(manufacturing_date !== undefined && { manufacturing_date }),
    ...(expiry_date !== undefined && { expiry_date }),
    updated_at: new Date().toISOString()
  };
  
  saveData(PRODUCTS_FILE, products); // Save to file
  
  res.json({
    message: 'Product updated successfully',
    product: products[productIndex]
  });
});

app.delete('/api/products/:id', authenticateToken, requireRole('manager'), (req, res) => {
  const { id } = req.params;
  const productIndex = products.findIndex(p => p.id === parseInt(id));
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  products.splice(productIndex, 1);
  saveData(PRODUCTS_FILE, products); // Save to file
  res.json({ message: 'Product deleted successfully' });
});

// Billing endpoints
app.get('/api/billing', authenticateToken, (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  
  let userBills = bills;
  if (req.user.role !== 'manager') {
    userBills = bills.filter(b => b.user_id === req.user.id);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedBills = userBills.slice(startIndex, endIndex);
  
  res.json({
    bills: paginatedBills,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: userBills.length,
      totalPages: Math.ceil(userBills.length / limit)
    }
  });
});

app.post('/api/billing', authenticateToken, async (req, res) => {
  const { items } = req.body;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items array is required and cannot be empty' });
  }
  
  let totalAmount = 0;
  const billItems = [];
  const productsToCheck = []; // Track products that need low stock check
  
  for (const item of items) {
    const product = products.find(p => p.id === item.product_id);
    if (!product) {
      return res.status(404).json({ error: `Product with ID ${item.product_id} not found` });
    }
    
    if (product.stock_quantity < item.quantity) {
      return res.status(400).json({ 
        error: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}` 
      });
    }
    
    const itemTotal = product.price * item.quantity;
    totalAmount += itemTotal;
    
    billItems.push({
      id: billItems.length + 1,
      product_id: product.id,
      product_name: product.name,
      quantity: item.quantity,
      unit_price: product.price,
      total_price: itemTotal
    });
    
    // Update stock
    product.stock_quantity -= item.quantity;
    
    // Track this product for low stock check
    productsToCheck.push(product);
  }
  
  const billNumber = `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  
  const newBill = {
    id: billCounter++,
    bill_number: billNumber,
    user_id: req.user.id,
    username: req.user.username,
    total_amount: totalAmount,
    status: 'pending',
    items: billItems,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  bills.push(newBill);
  saveData(BILLS_FILE, bills); // Save to file
  saveData(PRODUCTS_FILE, products); // Save updated stock quantities
  
  // Check for low stock immediately after billing (async, don't wait)
  setImmediate(async () => {
    const managerEmails = users.filter(u => u.role === 'manager').map(u => u.email);
    
    for (const product of productsToCheck) {
      const threshold = product.min_stock_threshold || 10;
      const notificationKey = `${product.id}-${threshold}`;
      
      // Check if stock dropped below threshold
      if (product.stock_quantity <= threshold && !lowStockNotificationsSent.has(notificationKey)) {
        console.log(`⚠️ BILLING ALERT: "${product.name}" dropped to ${product.stock_quantity} units (threshold: ${threshold})`);
        
        // Send email to all managers
        for (const managerEmail of managerEmails) {
          try {
            await sendLowStockAlert(managerEmail, {
              name: product.name,
              stock_quantity: product.stock_quantity,
              min_stock_threshold: threshold,
              price: product.price,
              sku: product.sku || 'N/A',
              category: product.category || 'N/A'
            });
            console.log(`📧 Low stock alert sent to ${managerEmail} for ${product.name}`);
          } catch (error) {
            console.error(`Failed to send low stock alert: ${error.message}`);
          }
        }
        
        // Mark as notified
        lowStockNotificationsSent.add(notificationKey);
      }
    }
  });
  
  res.status(201).json({
    message: 'Bill created successfully',
    bill: newBill
  });
});

// Trending Products API - REAL-TIME with actual billing data
app.get('/api/trending', authenticateToken, (req, res) => {
  const { filter = 'most_purchased', days = 30, limit = 10, category } = req.query;
  
  // Calculate date range
  const now = new Date();
  const startDate = new Date(now.getTime() - parseInt(days) * 24 * 60 * 60 * 1000);
  
  // Filter bills within the date range
  const recentBills = bills.filter(bill => {
    const billDate = new Date(bill.created_at);
    return billDate >= startDate && billDate <= now;
  });
  
  // Calculate real statistics for each product from actual bills
  const productStats = {};
  
  recentBills.forEach(bill => {
    bill.items.forEach(item => {
      if (!productStats[item.product_id]) {
        productStats[item.product_id] = {
          total_sold: 0,
          total_revenue: 0
        };
      }
      
      productStats[item.product_id].total_sold += item.quantity;
      productStats[item.product_id].total_revenue += item.total_price;
    });
  });
  
  // Build trending products with real data
  let trendingProducts = products.map(p => {
    const stats = productStats[p.id] || { total_sold: 0, total_revenue: 0 };
    const salesPerDay = stats.total_sold / parseInt(days);
    
    return {
      ...p,
      total_sold: stats.total_sold,
      total_revenue: stats.total_revenue,
      sales_per_day: salesPerDay.toFixed(2)
    };
  });
  
  // Filter by category if provided
  if (category) {
    trendingProducts = trendingProducts.filter(p => p.category === category);
  }
  
  // Sort based on filter
  switch (filter) {
    case 'most_purchased':
      trendingProducts.sort((a, b) => b.total_sold - a.total_sold);
      break;
    case 'fastest_selling':
      trendingProducts.sort((a, b) => parseFloat(b.sales_per_day) - parseFloat(a.sales_per_day));
      break;
    case 'highest_revenue':
      trendingProducts.sort((a, b) => b.total_revenue - a.total_revenue);
      break;
    case 'recently_added':
      trendingProducts.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      break;
  }
  
  // Filter out products with no sales (optional - show all or only sold products)
  // Uncomment next line to show only products that have been sold
  // trendingProducts = trendingProducts.filter(p => p.total_sold > 0);
  
  // Limit results
  trendingProducts = trendingProducts.slice(0, parseInt(limit));
  
  // Calculate summary
  const summary = {
    total_products: trendingProducts.length,
    total_items_sold: trendingProducts.reduce((sum, p) => sum + p.total_sold, 0),
    total_revenue: trendingProducts.reduce((sum, p) => sum + p.total_revenue, 0)
  };
  
  res.json({
    filter,
    period_days: parseInt(days),
    category: category || 'all',
    products: trendingProducts,
    summary,
    data_source: 'real_time_billing'
  });
});

// Get categories for trending filter
app.get('/api/trending/categories', authenticateToken, (req, res) => {
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  res.json({ categories: categories.map(cat => ({ category: cat })) });
});

// Weather API (existing functionality)
app.get('/api/location', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' });

    // Get current weather
    const weatherRes = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat,
        lon,
        units: 'metric',
        appid: process.env.WEATHER_API_KEY,
      },
    });

    // Get 5-day forecast
    const forecastRes = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        lat,
        lon,
        units: 'metric',
        appid: process.env.WEATHER_API_KEY,
      },
    });

    const weather = weatherRes.data;
    const forecast = forecastRes.data;

    // Process forecast data (simplified)
    const dailyForecast = forecast.list.slice(0, 5).map(item => ({
      date: new Date(item.dt * 1000).toLocaleDateString(),
      day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
      temp_min: Math.round(item.main.temp_min),
      temp_max: Math.round(item.main.temp_max),
      condition: item.weather[0].main,
      description: item.weather[0].description,
      humidity: item.main.humidity,
      wind_speed: Math.round(item.wind.speed * 3.6),
      precipitation_chance: Math.round((item.pop || 0) * 100)
    }));

    // Generate product recommendations based on weather
    const condition = weather.weather[0].main.toLowerCase();
    const temp = weather.main.temp;
    const humidity = weather.main.humidity;
    
    // Helper function to find products by keywords and add general recommendations
    const findProductsByKeywords = (keywords, generalItems, excludeList = []) => {
      const found = [];
      
      // First, find matching products from inventory
      for (const keyword of keywords) {
        const matches = products.filter(p => 
          p.stock_quantity > 0 && (
            p.name.toLowerCase().includes(keyword.toLowerCase()) ||
            p.category.toLowerCase().includes(keyword.toLowerCase())
          )
        );
        found.push(...matches);
      }
      
      // Get unique inventory products
      const uniqueProducts = [...new Map(found.map(p => [p.name, p])).values()];
      const inventoryProducts = uniqueProducts.map(p => p.name);
      
      // Combine with general necessary items (avoid duplicates)
      const combined = [...inventoryProducts];
      for (const item of generalItems) {
        if (!combined.some(p => p.toLowerCase().includes(item.toLowerCase()) || item.toLowerCase().includes(p.toLowerCase()))) {
          combined.push(item);
        }
      }
      
      // Filter out items already in excludeList
      const filtered = combined.filter(item => 
        !excludeList.some(excluded => 
          item.toLowerCase() === excluded.toLowerCase() ||
          item.toLowerCase().includes(excluded.toLowerCase()) ||
          excluded.toLowerCase().includes(item.toLowerCase())
        )
      );
      
      return filtered.slice(0, 8); // Limit to 8 total recommendations
    };
    
    let immediate = [];
    let upcoming = [];
    let seasonal = [];
    
    // Current weather recommendations - ONLY general weather-based products (no inventory)
    if (condition.includes('rain') || condition.includes('drizzle')) {
      immediate = ['Umbrellas', 'Raincoats', 'Waterproof Boots', 'Rain Ponchos', 'Waterproof Bags'];
    } else if (condition.includes('snow')) {
      immediate = ['Winter Coats', 'Snow Boots', 'Gloves', 'Scarves', 'Hand Warmers', 'Ice Scrapers'];
    } else if (condition.includes('clear') && temp > 25) {
      immediate = ['Sunglasses', 'Sunscreen', 'Hats', 'Cold Beverages', 'Fans', 'Ice Cream'];
    } else if (temp < 10) {
      immediate = ['Warm Clothing', 'Hot Beverages', 'Heaters', 'Blankets', 'Thermal Wear'];
    } else if (humidity > 70) {
      immediate = ['Dehumidifiers', 'Anti-fungal Products', 'Moisture Absorbers', 'Personal Care Items'];
    } else {
      // Default: recommend popular categories
      immediate = ['Fresh Produce', 'Dairy Products', 'Bakery Items', 'Beverages', 'Snacks'];
    }
    
    // Forecast-based upcoming recommendations - Hybrid (inventory + general products)
    const upcomingConditions = forecast.list.slice(0, 8).map(item => item.weather[0].main.toLowerCase());
    const avgTemp = forecast.list.slice(0, 8).reduce((sum, item) => sum + item.main.temp, 0) / 8;
    
    if (upcomingConditions.some(cond => cond.includes('rain'))) {
      const generalUpcomingRain = ['Rain Gear', 'Indoor Entertainment', 'Comfort Food', 'Hot Beverages'];
      upcoming = findProductsByKeywords(['rain', 'waterproof', 'indoor', 'entertainment', 'food', 'snack', 'hot'], generalUpcomingRain);
    } else if (upcomingConditions.some(cond => cond.includes('snow'))) {
      const generalUpcomingSnow = ['Winter Emergency Kits', 'Snow Removal Tools', 'Warm Food Items', 'Batteries'];
      upcoming = findProductsByKeywords(['winter', 'warm', 'food', 'hot', 'emergency', 'battery'], generalUpcomingSnow);
    } else if (avgTemp > 25) {
      const generalUpcomingSummer = ['Summer Essentials', 'Cooling Products', 'Outdoor Gear', 'Sunscreen'];
      upcoming = findProductsByKeywords(['summer', 'cool', 'outdoor', 'beverage', 'drink', 'sunglasses', 'sunscreen'], generalUpcomingSummer);
    }
    
    // Seasonal recommendations based on month - Hybrid (inventory + general products)
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) { // Spring
      const generalSpring = ['Gardening Supplies', 'Spring Cleaning Products', 'Allergy Medications', 'Light Clothing'];
      seasonal = findProductsByKeywords(['garden', 'spring', 'cleaning', 'soap', 'shampoo', 'personal care', 'allergy'], generalSpring);
    } else if (month >= 5 && month <= 7) { // Summer
      const generalSummer = ['Beach Accessories', 'BBQ Supplies', 'Air Conditioners', 'Sunscreen', 'Swimwear'];
      seasonal = findProductsByKeywords(['beach', 'bbq', 'summer', 'sunglasses', 'beverage', 'accessories', 'swim'], generalSummer);
    } else if (month >= 8 && month <= 10) { // Fall
      const generalFall = ['Back-to-School Items', 'Warm Clothing', 'Halloween Decorations', 'Comfort Food'];
      seasonal = findProductsByKeywords(['school', 'warm', 'clothing', 'accessories', 'halloween', 'comfort'], generalFall);
    } else { // Winter
      const generalWinter = ['Holiday Decorations', 'Winter Sports Gear', 'Warm Beverages', 'Gift Items'];
      seasonal = findProductsByKeywords(['holiday', 'winter', 'warm', 'beverage', 'food', 'gift', 'decoration'], generalWinter);
    }
    
    const recommendedProducts = { immediate, upcoming, seasonal };

    // Generate insights
    const temps = forecast.list.slice(0, 8).map(item => item.main.temp);
    const forecastAvgTemp = temps.reduce((sum, t) => sum + t, 0) / temps.length;
    
    let weather_trend = '';
    let business_impact = '';
    let inventory_suggestions = [];
    
    if (forecastAvgTemp > temp + 3) {
      weather_trend = 'Temperature rising - warmer days ahead';
      inventory_suggestions.push('Increase cooling products stock');
    } else if (forecastAvgTemp < temp - 3) {
      weather_trend = 'Temperature dropping - cooler weather expected';
      inventory_suggestions.push('Prepare winter/warm clothing inventory');
    } else {
      weather_trend = 'Stable weather conditions expected';
    }
    
    if (condition.includes('rain')) {
      business_impact = 'Rainy weather may reduce foot traffic but increase indoor product sales';
      inventory_suggestions.push('Promote home entertainment and comfort items');
    } else if (condition.includes('clear') && temp > 20) {
      business_impact = 'Good weather likely to increase foot traffic and outdoor product sales';
      inventory_suggestions.push('Feature outdoor and recreational products prominently');
    } else if (temp < 5) {
      business_impact = 'Cold weather may reduce overall traffic but increase essential item sales';
      inventory_suggestions.push('Focus on warm clothing and hot beverages');
    }
    
    const insights = { weather_trend, business_impact, inventory_suggestions };

    res.json({
      location: weather.name,
      country: weather.sys.country,
      temperature: Math.round(weather.main.temp),
      weather: weather.weather[0].main,
      description: weather.weather[0].description,
      humidity: weather.main.humidity,
      wind_speed: Math.round(weather.wind.speed * 3.6),
      forecast: dailyForecast,
      recommendedProducts,
      insights
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Check for products nearing expiry and send notifications
const checkExpiringProducts = async () => {
  const today = new Date();
  const tenDaysFromNow = new Date();
  tenDaysFromNow.setDate(today.getDate() + 10);
  
  // Get all manager emails
  const managerEmails = users
    .filter(u => u.role === 'manager')
    .map(u => u.email);
  
  if (managerEmails.length === 0) {
    console.log('No manager emails found for expiry notifications');
    return;
  }
  
  for (const product of products) {
    if (!product.expiry_date) continue;
    
    const expiryDate = new Date(product.expiry_date);
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    // Check if product expires within 10 days and notification hasn't been sent
    const notificationKey = `${product.id}-${product.batch_no}-${product.expiry_date}`;
    
    if (daysUntilExpiry <= 10 && daysUntilExpiry >= 0 && !expiryNotificationsSent.has(notificationKey)) {
      console.log(`⚠️ Product "${product.name}" (Batch: ${product.batch_no}) expires in ${daysUntilExpiry} days`);
      
      // Send email to all managers
      for (const managerEmail of managerEmails) {
        try {
          await sendExpiryAlert(managerEmail, {
            name: product.name,
            batch_no: product.batch_no,
            expiry_date: product.expiry_date,
            manufacturing_date: product.manufacturing_date,
            stock_quantity: product.stock_quantity,
            sku: product.sku,
            daysUntilExpiry
          });
        } catch (error) {
          console.error(`Failed to send expiry alert for ${product.name}:`, error.message);
        }
      }
      
      // Mark as notified
      expiryNotificationsSent.add(notificationKey);
    }
  }
};

// Check for low stock products and send notifications
const checkLowStockProducts = async () => {
  // Get all manager emails
  const managerEmails = users
    .filter(u => u.role === 'manager')
    .map(u => u.email);
  
  if (managerEmails.length === 0) {
    console.log('No manager emails found for low stock notifications');
    return;
  }
  
  for (const product of products) {
    const threshold = product.min_stock_threshold || 10; // Default threshold of 10
    
    // Check if stock is below threshold
    const notificationKey = `${product.id}-${threshold}`;
    
    if (product.stock_quantity <= threshold && !lowStockNotificationsSent.has(notificationKey)) {
      console.log(`⚠️ Low stock alert: "${product.name}" has ${product.stock_quantity} units (threshold: ${threshold})`);
      
      // Send email to all managers
      for (const managerEmail of managerEmails) {
        try {
          await sendLowStockAlert(managerEmail, {
            name: product.name,
            stock_quantity: product.stock_quantity,
            min_stock_threshold: threshold,
            price: product.price,
            sku: product.sku || 'N/A',
            category: product.category || 'N/A'
          });
        } catch (error) {
          console.error(`Failed to send low stock alert for ${product.name}:`, error.message);
        }
      }
      
      // Mark as notified
      lowStockNotificationsSent.add(notificationKey);
    } else if (product.stock_quantity > threshold && lowStockNotificationsSent.has(notificationKey)) {
      // Remove from notified set if stock has been replenished
      lowStockNotificationsSent.delete(notificationKey);
    }
  }
};

// API endpoint to manually trigger expiry check
app.post('/api/products/check-expiry', authenticateToken, requireRole('manager'), async (req, res) => {
  try {
    await checkExpiringProducts();
    res.json({ message: 'Expiry check completed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check expiring products' });
  }
});

// API endpoint to manually trigger low stock check
app.post('/api/products/check-low-stock', authenticateToken, requireRole('manager'), async (req, res) => {
  try {
    await checkLowStockProducts();
    res.json({ message: 'Low stock check completed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check low stock products' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Retail KPI Mock Server running on port ${PORT}`);
  console.log(`📊 Weather API: http://localhost:${PORT}/api/location`);
  console.log(`🔐 Authentication: http://localhost:${PORT}/api/auth`);
  console.log(`📦 Products: http://localhost:${PORT}/api/products`);
  console.log(`💰 Billing: http://localhost:${PORT}/api/billing`);
  console.log(`❤️ Health Check: http://localhost:${PORT}/api/health`);
  console.log(`\n🎯 Demo Credentials:`);
  console.log(`Manager: admin / admin123`);
  console.log(`Cashier: cashier1 / cashier123`);
  
  // Check for expiring products on startup (after 2 seconds - faster!)
  setTimeout(checkExpiringProducts, 2000);
  
  // Check for low stock products on startup (after 2 seconds - faster!)
  setTimeout(checkLowStockProducts, 2000);
  
  // Check for expiring products every hour
  setInterval(checkExpiringProducts, 60 * 60 * 1000);
  
  // Check for low stock products every hour
  setInterval(checkLowStockProducts, 60 * 60 * 1000);
});
