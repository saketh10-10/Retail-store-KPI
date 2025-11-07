const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const createTransporter = () => {
  // For development, use ethereal email or configure with actual SMTP
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // For testing without real email config, log to console
    console.warn('Email configuration not found. Emails will be logged to console only.');
    return null;
  }
};

// Send low stock alert email
const sendLowStockAlert = async (managerEmail, productDetails) => {
  const transporter = createTransporter();

  const { name, stock_quantity, min_stock_threshold, price } = productDetails;

  const subject = `Stock Alert – "${name}" is running low`;
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 5px 5px; }
        .alert-box { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
        .product-details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { font-weight: bold; color: #6b7280; }
        .detail-value { color: #111827; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        .urgent { color: #dc2626; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Low Stock Alert</h1>
        </div>
        <div class="content">
          <div class="alert-box">
            <p><strong>Attention Required!</strong></p>
            <p>The current stock for <strong>${name}</strong> has dropped below the minimum threshold. Please restock soon to avoid stockouts.</p>
          </div>
          
          <div class="product-details">
            <h3>Product Details</h3>
            <div class="detail-row">
              <span class="detail-label">Product Name:</span>
              <span class="detail-value">${name}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Current Stock:</span>
              <span class="detail-value urgent">${stock_quantity} units</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Minimum Threshold:</span>
              <span class="detail-value">${min_stock_threshold} units</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Price:</span>
              <span class="detail-value">₹${price.toFixed(2)}</span>
            </div>
          </div>
          
          <p><strong>Action Required:</strong> Please arrange for restocking this product as soon as possible to maintain optimal inventory levels.</p>
        </div>
        <div class="footer">
          <p>This is an automated notification from your Retail KPI Management System.</p>
          <p>Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textBody = `
Stock Alert – "${name}" is running low

The current stock for ${name} has dropped below the minimum threshold. Please restock soon.

Product Details:
- Product Name: ${name}
- Current Stock: ${stock_quantity} units
- Minimum Threshold: ${min_stock_threshold} units
- Price: ₹${price.toFixed(2)}

Action Required: Please arrange for restocking this product as soon as possible.

---
This is an automated notification from your Retail KPI Management System.
  `;

  if (!transporter) {
    // Log email to console if no transporter configured
    console.log('\n=== LOW STOCK ALERT EMAIL ===');
    console.log(`To: ${managerEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(textBody);
    console.log('=============================\n');
    return { success: true, message: 'Email logged to console (no SMTP configured)' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Retail KPI System" <${process.env.EMAIL_USER}>`,
      to: managerEmail,
      subject: subject,
      text: textBody,
      html: htmlBody,
    });

    console.log('Low stock alert email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending low stock alert email:', error);
    return { success: false, error: error.message };
  }
};

// Send test email
const sendTestEmail = async (recipientEmail) => {
  const transporter = createTransporter();

  const subject = 'Test Email from Retail KPI System';
  const htmlBody = `
    <h2>Test Email</h2>
    <p>This is a test email from your Retail KPI Management System.</p>
    <p>If you received this email, your email configuration is working correctly.</p>
  `;

  if (!transporter) {
    console.log('\n=== TEST EMAIL ===');
    console.log(`To: ${recipientEmail}`);
    console.log(`Subject: ${subject}`);
    console.log('Email configuration not set up. Check .env file.');
    console.log('==================\n');
    return { success: true, message: 'Email logged to console (no SMTP configured)' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Retail KPI System" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: subject,
      html: htmlBody,
    });

    console.log('Test email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending test email:', error);
    return { success: false, error: error.message };
  }
};

// Send expiry alert email
const sendExpiryAlert = async (managerEmail, productDetails) => {
  const transporter = createTransporter();

  const { name, batch_no, expiry_date, manufacturing_date, stock_quantity, sku, daysUntilExpiry } = productDetails;

  const subject = `⚠️ Product Expiry Alert – "${name}" (Batch: ${batch_no})`;
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 5px 5px; }
        .alert-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .product-details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { font-weight: bold; color: #6b7280; }
        .detail-value { color: #111827; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        .urgent { color: #dc2626; font-weight: bold; }
        .warning { color: #f59e0b; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Product Expiry Alert</h1>
        </div>
        <div class="content">
          <div class="alert-box">
            <p><strong>Attention Required!</strong></p>
            <p>The product <strong>${name}</strong> (Batch: ${batch_no}) will expire in <span class="warning">${daysUntilExpiry} days</span>. Please take necessary action to prevent inventory loss.</p>
          </div>
          
          <div class="product-details">
            <h3>Product Details</h3>
            <div class="detail-row">
              <span class="detail-label">Product Name:</span>
              <span class="detail-value">${name}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">SKU:</span>
              <span class="detail-value">${sku || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Batch Number:</span>
              <span class="detail-value">${batch_no}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Manufacturing Date:</span>
              <span class="detail-value">${new Date(manufacturing_date).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Expiry Date:</span>
              <span class="detail-value urgent">${new Date(expiry_date).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Days Until Expiry:</span>
              <span class="detail-value warning">${daysUntilExpiry} days</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Current Stock:</span>
              <span class="detail-value">${stock_quantity} units</span>
            </div>
          </div>
          
          <p><strong>Recommended Actions:</strong></p>
          <ul>
            <li>Consider offering discounts to move inventory faster</li>
            <li>Prioritize this product for promotional activities</li>
            <li>Review stock levels and adjust future orders</li>
            <li>Remove expired products from inventory immediately after expiry</li>
          </ul>
        </div>
        <div class="footer">
          <p>This is an automated notification from your Retail KPI Management System.</p>
          <p>Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textBody = `
Product Expiry Alert – "${name}" (Batch: ${batch_no})

The product ${name} (Batch: ${batch_no}) will expire in ${daysUntilExpiry} days. Please take necessary action.

Product Details:
- Product Name: ${name}
- SKU: ${sku || 'N/A'}
- Batch Number: ${batch_no}
- Manufacturing Date: ${new Date(manufacturing_date).toLocaleDateString()}
- Expiry Date: ${new Date(expiry_date).toLocaleDateString()}
- Days Until Expiry: ${daysUntilExpiry} days
- Current Stock: ${stock_quantity} units

Recommended Actions:
- Consider offering discounts to move inventory faster
- Prioritize this product for promotional activities
- Review stock levels and adjust future orders
- Remove expired products from inventory immediately after expiry

---
This is an automated notification from your Retail KPI Management System.
  `;

  if (!transporter) {
    // Log email to console if no transporter configured
    console.log('\n=== PRODUCT EXPIRY ALERT EMAIL ===');
    console.log(`To: ${managerEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(textBody);
    console.log('==================================\n');
    return { success: true, message: 'Email logged to console (no SMTP configured)' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Retail KPI System" <${process.env.EMAIL_USER}>`,
      to: managerEmail,
      subject: subject,
      text: textBody,
      html: htmlBody,
    });

    console.log('Product expiry alert email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending product expiry alert email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendLowStockAlert,
  sendTestEmail,
  sendExpiryAlert,
};
