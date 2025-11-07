const { sendLowStockAlert } = require('./services/emailService');
require('dotenv').config();

async function testEmail() {
  console.log('\n=== Testing Email Configuration ===\n');
  
  console.log('SMTP Settings:');
  console.log(`  Host: ${process.env.EMAIL_HOST}`);
  console.log(`  Port: ${process.env.EMAIL_PORT}`);
  console.log(`  User: ${process.env.EMAIL_USER}`);
  console.log(`  Pass: ${process.env.EMAIL_PASS ? process.env.EMAIL_PASS.substring(0, 4) + '****' : 'NOT SET'}`);
  console.log('');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email credentials not configured in .env file!');
    console.log('Please add EMAIL_USER and EMAIL_PASS to .env');
    process.exit(1);
  }
  
  console.log('Sending test email to: suryasaketh185@gmail.com\n');
  
  const testProduct = {
    name: 'Test Product - Soap Bar',
    stock_quantity: 5,
    min_stock_threshold: 10,
    price: 2.50
  };
  
  try {
    const result = await sendLowStockAlert('suryasaketh185@gmail.com', testProduct);
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('');
      console.log('Check your inbox: suryasaketh185@gmail.com');
      console.log('Subject: Stock Alert – "Test Product - Soap Bar" is running low');
      console.log('');
      console.log('If you don\'t see it:');
      console.log('  1. Check spam/junk folder');
      console.log('  2. Wait a few minutes');
      console.log('  3. Verify Gmail App Password is correct');
    } else {
      console.log('❌ Failed to send email');
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.log('❌ Error sending email:');
    console.log(error.message);
    console.log('');
    console.log('Common issues:');
    console.log('  1. Gmail App Password is incorrect');
    console.log('  2. 2-Step Verification not enabled');
    console.log('  3. Internet connection issue');
  }
  
  process.exit(0);
}

testEmail();
