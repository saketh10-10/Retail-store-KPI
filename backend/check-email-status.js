const database = require('./database/connection');
require('dotenv').config();

async function checkStatus() {
  await database.connect();
  
  console.log('\n=== EMAIL SYSTEM STATUS ===\n');

  // Check manager settings
  console.log('1. Manager Email Settings:');
  const settings = await database.all('SELECT * FROM manager_settings');
  if (settings.length === 0) {
    console.log('   ❌ No manager email configured yet!');
    console.log('   → Login as manager and enter your email\n');
  } else {
    settings.forEach(s => {
      console.log(`   ✅ Email: ${s.notification_email}`);
      console.log(`   ✅ Alerts Enabled: ${s.enable_low_stock_alerts ? 'Yes' : 'No'}\n`);
    });
  }

  // Check low stock products
  console.log('2. Low Stock Products:');
  const lowStock = await database.all(`
    SELECT name, stock_quantity, min_stock_threshold 
    FROM products 
    WHERE stock_quantity <= min_stock_threshold
  `);

  if (lowStock.length === 0) {
    console.log('   ℹ️  No products below threshold');
    console.log('   → Create a bill to reduce stock below 10\n');
  } else {
    lowStock.forEach(p => {
      console.log(`   ⚠️  ${p.name}: ${p.stock_quantity} units (threshold: ${p.min_stock_threshold})`);
    });
    console.log('');
  }

  // Check recent bills
  console.log('3. Recent Bills:');
  const bills = await database.all('SELECT * FROM bills ORDER BY created_at DESC LIMIT 3');
  if (bills.length === 0) {
    console.log('   ℹ️  No bills created yet\n');
  } else {
    bills.forEach(b => {
      console.log(`   Bill #${b.id}: ₹${b.total_amount} (${b.created_at})`);
    });
    console.log('');
  }

  // Check .env configuration
  console.log('4. Email Configuration (.env):');
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log(`   ✅ EMAIL_USER: ${process.env.EMAIL_USER}`);
    console.log(`   ✅ EMAIL_PASS: ${process.env.EMAIL_PASS.substring(0, 4)}****`);
    console.log('');
  } else {
    console.log('   ❌ Email credentials not configured in .env\n');
  }

  console.log('=== NEXT STEPS ===');
  if (settings.length === 0) {
    console.log('1. Login as manager (admin/admin123)');
    console.log('2. Enter email: suryasaketh76@gmail.com');
    console.log('3. Create a bill that reduces stock below 10');
  } else if (lowStock.length === 0) {
    console.log('1. Go to Billing page');
    console.log('2. Create a bill with 95 units of any product (with 100 stock)');
    console.log('3. Check your email inbox!');
  } else {
    console.log('✅ Everything is set up!');
    console.log('If you created a bill and stock dropped, check:');
    console.log('- Email inbox (and spam folder)');
    console.log('- Backend console for error messages');
  }
  console.log('');

  await database.close();
  process.exit(0);
}

checkStatus().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
