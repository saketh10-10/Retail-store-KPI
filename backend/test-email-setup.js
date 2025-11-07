const { sendLowStockAlert, sendExpiryAlert, sendTestEmail } = require('./services/emailService');
require('dotenv').config();

console.log('\n=== EMAIL CONFIGURATION CHECK ===\n');

// Check if email is configured
if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  console.log('✅ Email configuration found:');
  console.log(`   Host: ${process.env.EMAIL_HOST}`);
  console.log(`   Port: ${process.env.EMAIL_PORT || 587}`);
  console.log(`   User: ${process.env.EMAIL_USER}`);
  console.log(`   Pass: ${'*'.repeat(process.env.EMAIL_PASS.length)} (hidden)`);
  console.log('\n📧 Attempting to send test email...\n');
} else {
  console.log('❌ Email configuration NOT found in .env file');
  console.log('\n⚠️  Emails will only be logged to console, not actually sent.\n');
  console.log('To fix this, add the following to your backend/.env file:\n');
  console.log('EMAIL_HOST=smtp.gmail.com');
  console.log('EMAIL_PORT=587');
  console.log('EMAIL_SECURE=false');
  console.log('EMAIL_USER=your-email@gmail.com');
  console.log('EMAIL_PASS=your-app-specific-password\n');
  console.log('For Gmail, generate an app-specific password at:');
  console.log('https://myaccount.google.com/apppasswords\n');
  process.exit(0);
}

async function testEmailSetup() {
  try {
    // Prompt for email address
    console.log('Enter your email address to receive test notifications:');
    console.log('(Press Ctrl+C to cancel)\n');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Your email: ', async (email) => {
      rl.close();
      
      if (!email || !email.includes('@')) {
        console.log('\n❌ Invalid email address');
        process.exit(1);
      }

      console.log(`\n📧 Sending test emails to: ${email}\n`);

      // Test 1: Simple test email
      console.log('1️⃣  Sending simple test email...');
      const testResult = await sendTestEmail(email);
      if (testResult.success) {
        console.log('   ✅ Test email sent successfully!');
        if (testResult.messageId) {
          console.log(`   📨 Message ID: ${testResult.messageId}`);
        }
      } else {
        console.log(`   ❌ Failed: ${testResult.error || testResult.message}`);
      }

      // Test 2: Low stock alert
      console.log('\n2️⃣  Sending low stock alert email...');
      const lowStockResult = await sendLowStockAlert(email, {
        name: 'Test Product',
        stock_quantity: 5,
        min_stock_threshold: 20,
        price: 99.99,
        sku: 'TEST001',
        category: 'Test Category'
      });
      if (lowStockResult.success) {
        console.log('   ✅ Low stock alert sent successfully!');
        if (lowStockResult.messageId) {
          console.log(`   📨 Message ID: ${lowStockResult.messageId}`);
        }
      } else {
        console.log(`   ❌ Failed: ${lowStockResult.error || lowStockResult.message}`);
      }

      // Test 3: Expiry alert
      console.log('\n3️⃣  Sending expiry alert email...');
      const expiryResult = await sendExpiryAlert(email, {
        name: 'Test Product',
        batch_no: 'BATCH-TEST',
        manufacturing_date: '2024-10-01',
        expiry_date: '2024-11-05',
        stock_quantity: 50,
        sku: 'TEST001',
        daysUntilExpiry: 8
      });
      if (expiryResult.success) {
        console.log('   ✅ Expiry alert sent successfully!');
        if (expiryResult.messageId) {
          console.log(`   📨 Message ID: ${expiryResult.messageId}`);
        }
      } else {
        console.log(`   ❌ Failed: ${expiryResult.error || expiryResult.message}`);
      }

      console.log('\n=== EMAIL TEST COMPLETE ===\n');
      console.log('📬 Check your inbox (and spam folder) for the test emails.');
      console.log('   If you received them, your email configuration is working correctly!\n');
      
      process.exit(0);
    });

  } catch (error) {
    console.error('\n❌ Error during email test:', error.message);
    process.exit(1);
  }
}

testEmailSetup();
