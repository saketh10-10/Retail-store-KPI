const express = require('express');
const database = require('../database/connection');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sendTestEmail } = require('../services/emailService');

const router = express.Router();

// Get manager settings
router.get('/', authenticateToken, requireRole('manager'), async (req, res) => {
  try {
    const settings = await database.get(
      'SELECT * FROM manager_settings WHERE user_id = ?',
      [req.user.id]
    );

    if (!settings) {
      return res.json({
        settings: null,
        message: 'No settings found. Please configure your email.'
      });
    }

    res.json({ settings });
  } catch (error) {
    console.error('Error fetching manager settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Create or update manager settings
router.post('/', authenticateToken, requireRole('manager'), async (req, res) => {
  try {
    const { notification_email, enable_low_stock_alerts } = req.body;

    if (!notification_email) {
      return res.status(400).json({ error: 'Notification email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(notification_email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if settings already exist
    const existingSettings = await database.get(
      'SELECT * FROM manager_settings WHERE user_id = ?',
      [req.user.id]
    );

    if (existingSettings) {
      // Update existing settings
      await database.run(
        `UPDATE manager_settings 
         SET notification_email = ?, 
             enable_low_stock_alerts = ?,
             updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = ?`,
        [
          notification_email,
          enable_low_stock_alerts !== undefined ? (enable_low_stock_alerts ? 1 : 0) : 1,
          req.user.id
        ]
      );
    } else {
      // Create new settings
      await database.run(
        `INSERT INTO manager_settings (user_id, notification_email, enable_low_stock_alerts) 
         VALUES (?, ?, ?)`,
        [
          req.user.id,
          notification_email,
          enable_low_stock_alerts !== undefined ? (enable_low_stock_alerts ? 1 : 0) : 1
        ]
      );
    }

    const updatedSettings = await database.get(
      'SELECT * FROM manager_settings WHERE user_id = ?',
      [req.user.id]
    );

    res.json({
      message: 'Settings saved successfully',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Error saving manager settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// Send test email
router.post('/test-email', authenticateToken, requireRole('manager'), async (req, res) => {
  try {
    const settings = await database.get(
      'SELECT * FROM manager_settings WHERE user_id = ?',
      [req.user.id]
    );

    if (!settings) {
      return res.status(400).json({ 
        error: 'Please configure your email settings first' 
      });
    }

    const result = await sendTestEmail(settings.notification_email);

    if (result.success) {
      res.json({
        message: 'Test email sent successfully',
        details: result
      });
    } else {
      res.status(500).json({
        error: 'Failed to send test email',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

// Toggle low stock alerts
router.patch('/toggle-alerts', authenticateToken, requireRole('manager'), async (req, res) => {
  try {
    const { enable } = req.body;

    const settings = await database.get(
      'SELECT * FROM manager_settings WHERE user_id = ?',
      [req.user.id]
    );

    if (!settings) {
      return res.status(400).json({ 
        error: 'Please configure your email settings first' 
      });
    }

    await database.run(
      `UPDATE manager_settings 
       SET enable_low_stock_alerts = ?,
           updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = ?`,
      [enable ? 1 : 0, req.user.id]
    );

    const updatedSettings = await database.get(
      'SELECT * FROM manager_settings WHERE user_id = ?',
      [req.user.id]
    );

    res.json({
      message: `Low stock alerts ${enable ? 'enabled' : 'disabled'}`,
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Error toggling alerts:', error);
    res.status(500).json({ error: 'Failed to toggle alerts' });
  }
});

module.exports = router;
