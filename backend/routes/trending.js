const express = require('express');
const database = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get trending products with multiple filter options
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      filter = 'most_purchased', 
      limit = 10, 
      days = 30,
      category 
    } = req.query;

    let sql = '';
    let params = [];
    const limitNum = parseInt(limit);
    const daysNum = parseInt(days);

    switch (filter) {
      case 'most_purchased':
        // Products with highest total quantity sold
        sql = `
          SELECT 
            p.id,
            p.name,
            p.description,
            p.price,
            p.stock_quantity,
            p.category,
            p.sku,
            SUM(bi.quantity) as total_sold,
            COUNT(DISTINCT bi.bill_id) as order_count,
            SUM(bi.total_price) as total_revenue
          FROM products p
          INNER JOIN bill_items bi ON p.id = bi.product_id
          INNER JOIN bills b ON bi.bill_id = b.id
          WHERE b.status = 'completed'
            AND DATE(b.created_at) >= DATE('now', '-' || ? || ' days')
        `;
        params.push(daysNum);

        if (category) {
          sql += ' AND p.category = ?';
          params.push(category);
        }

        sql += `
          GROUP BY p.id, p.name, p.description, p.price, p.stock_quantity, p.category, p.sku
          ORDER BY total_sold DESC
          LIMIT ?
        `;
        params.push(limitNum);
        break;

      case 'most_viewed':
        // Products with highest view count
        sql = `
          SELECT 
            p.id,
            p.name,
            p.description,
            p.price,
            p.stock_quantity,
            p.category,
            p.sku,
            p.view_count,
            COALESCE(SUM(bi.quantity), 0) as total_sold,
            COALESCE(COUNT(DISTINCT bi.bill_id), 0) as order_count
          FROM products p
          LEFT JOIN bill_items bi ON p.id = bi.product_id
          LEFT JOIN bills b ON bi.bill_id = b.id AND b.status = 'completed' 
            AND DATE(b.created_at) >= DATE('now', '-' || ? || ' days')
          WHERE 1=1
        `;
        params.push(daysNum);

        if (category) {
          sql += ' AND p.category = ?';
          params.push(category);
        }

        sql += `
          GROUP BY p.id, p.name, p.description, p.price, p.stock_quantity, p.category, p.sku, p.view_count
          ORDER BY p.view_count DESC
          LIMIT ?
        `;
        params.push(limitNum);
        break;

      case 'fastest_selling':
        // Products with highest sales velocity (sales per day)
        sql = `
          SELECT 
            p.id,
            p.name,
            p.description,
            p.price,
            p.stock_quantity,
            p.category,
            p.sku,
            SUM(bi.quantity) as total_sold,
            COUNT(DISTINCT bi.bill_id) as order_count,
            CAST(SUM(bi.quantity) AS FLOAT) / ? as sales_per_day
          FROM products p
          INNER JOIN bill_items bi ON p.id = bi.product_id
          INNER JOIN bills b ON bi.bill_id = b.id
          WHERE b.status = 'completed'
            AND DATE(b.created_at) >= DATE('now', '-' || ? || ' days')
        `;
        params.push(daysNum, daysNum);

        if (category) {
          sql += ' AND p.category = ?';
          params.push(category);
        }

        sql += `
          GROUP BY p.id, p.name, p.description, p.price, p.stock_quantity, p.category, p.sku
          ORDER BY sales_per_day DESC
          LIMIT ?
        `;
        params.push(limitNum);
        break;

      case 'highest_revenue':
        // Products generating highest revenue
        sql = `
          SELECT 
            p.id,
            p.name,
            p.description,
            p.price,
            p.stock_quantity,
            p.category,
            p.sku,
            SUM(bi.quantity) as total_sold,
            COUNT(DISTINCT bi.bill_id) as order_count,
            SUM(bi.total_price) as total_revenue
          FROM products p
          INNER JOIN bill_items bi ON p.id = bi.product_id
          INNER JOIN bills b ON bi.bill_id = b.id
          WHERE b.status = 'completed'
            AND DATE(b.created_at) >= DATE('now', '-' || ? || ' days')
        `;
        params.push(daysNum);

        if (category) {
          sql += ' AND p.category = ?';
          params.push(category);
        }

        sql += `
          GROUP BY p.id, p.name, p.description, p.price, p.stock_quantity, p.category, p.sku
          ORDER BY total_revenue DESC
          LIMIT ?
        `;
        params.push(limitNum);
        break;

      case 'recently_added':
        // Recently added products
        sql = `
          SELECT 
            p.id,
            p.name,
            p.description,
            p.price,
            p.stock_quantity,
            p.category,
            p.sku,
            p.created_at,
            COALESCE(SUM(bi.quantity), 0) as total_sold
          FROM products p
          LEFT JOIN bill_items bi ON p.id = bi.product_id
          LEFT JOIN bills b ON bi.bill_id = b.id AND b.status = 'completed'
          WHERE 1=1
        `;

        if (category) {
          sql += ' AND p.category = ?';
          params.push(category);
        }

        sql += `
          GROUP BY p.id, p.name, p.description, p.price, p.stock_quantity, p.category, p.sku, p.created_at
          ORDER BY p.created_at DESC
          LIMIT ?
        `;
        params.push(limitNum);
        break;

      default:
        return res.status(400).json({ 
          error: 'Invalid filter. Use: most_purchased, most_viewed, fastest_selling, highest_revenue, or recently_added' 
        });
    }

    const products = await database.all(sql, params);

    // Get summary statistics
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT p.id) as total_products,
        SUM(bi.quantity) as total_items_sold,
        SUM(bi.total_price) as total_revenue,
        COUNT(DISTINCT b.id) as total_orders
      FROM products p
      LEFT JOIN bill_items bi ON p.id = bi.product_id
      LEFT JOIN bills b ON bi.bill_id = b.id 
        AND b.status = 'completed'
        AND DATE(b.created_at) >= DATE('now', '-' || ? || ' days')
    `;
    
    const stats = await database.get(statsQuery, [daysNum]);

    res.json({
      filter,
      period_days: daysNum,
      category: category || 'all',
      products: products.map(p => ({
        ...p,
        price: parseFloat(p.price),
        total_sold: p.total_sold || 0,
        total_revenue: p.total_revenue ? parseFloat(p.total_revenue) : 0,
        sales_per_day: p.sales_per_day ? parseFloat(p.sales_per_day).toFixed(2) : null
      })),
      summary: {
        total_products: stats.total_products || 0,
        total_items_sold: stats.total_items_sold || 0,
        total_revenue: stats.total_revenue ? parseFloat(stats.total_revenue) : 0,
        total_orders: stats.total_orders || 0
      }
    });
  } catch (error) {
    console.error('Error fetching trending products:', error);
    res.status(500).json({ error: 'Failed to fetch trending products' });
  }
});

// Track product view
router.post('/view/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await database.get('SELECT id FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Increment view count
    await database.run(
      'UPDATE products SET view_count = view_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    res.json({ message: 'Product view tracked' });
  } catch (error) {
    console.error('Error tracking product view:', error);
    res.status(500).json({ error: 'Failed to track product view' });
  }
});

// Get trending categories
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days);

    const sql = `
      SELECT 
        p.category,
        COUNT(DISTINCT p.id) as product_count,
        SUM(bi.quantity) as total_sold,
        SUM(bi.total_price) as total_revenue,
        COUNT(DISTINCT bi.bill_id) as order_count
      FROM products p
      INNER JOIN bill_items bi ON p.id = bi.product_id
      INNER JOIN bills b ON bi.bill_id = b.id
      WHERE b.status = 'completed'
        AND DATE(b.created_at) >= DATE('now', '-' || ? || ' days')
        AND p.category IS NOT NULL
      GROUP BY p.category
      ORDER BY total_sold DESC
    `;

    const categories = await database.all(sql, [daysNum]);

    res.json({
      period_days: daysNum,
      categories: categories.map(c => ({
        ...c,
        total_revenue: parseFloat(c.total_revenue)
      }))
    });
  } catch (error) {
    console.error('Error fetching trending categories:', error);
    res.status(500).json({ error: 'Failed to fetch trending categories' });
  }
});

module.exports = router;
