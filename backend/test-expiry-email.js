const { sendExpiryAlert } = require('./services/emailService');
require('dotenv').config();

async function testExpiryEmail() {
  console.log('\n=== Testing Expiry Alert Email ===\n');
  
  console.log('SMTP Settings:');
  console.log(`  Host: ${process.env.EMAIL_HOST}`);
  console.log(`  User: ${process.env.EMAIL_USER}`);
  console.log('');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email credentials not configured in .env file!');
    process.exit(1);
  }
  
  console.log('Sending expiry alert email to: suryasaketh185@gmail.com\n');
  
  const testProduct = {
    name: 'Fresh Milk',
    batch_no: 'BATCH-2024-11-001',
    expiry_date: '2024-11-15',
    manufacturing_date: '2024-11-01',
    stock_quantity: 50,
    sku: 'MILK001',
    daysUntilExpiry: 8
  };
  
  try {
    const result = await sendExpiryAlert('suryasaketh185@gmail.com', testProduct);
    
    if (result.success) {
      console.log('✅ Expiry alert email sent successfully!');
      console.log('');
      console.log('Check your inbox: suryasaketh185@gmail.com');
      console.log('Subject: ⚠️ Product Expiry Alert – "Fresh Milk" (Batch: BATCH-2024-11-001)');
      console.log('');
      console.log('Email includes:');
      console.log('  - Product name and batch number');
      console.log('  - Manufacturing and expiry dates');
      console.log('  - Days until expiry (8 days)');
      console.log('  - Current stock quantity');
      console.log('  - Recommended actions');
      console.log('');
      console.log('If you don\'t see it, check spam/junk folder');
    } else {
      console.log('❌ Failed to send email');
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.log('❌ Error sending email:');
    console.log(error.message);
  }
  
  process.exit(0);
}

testExpiryEmail();
