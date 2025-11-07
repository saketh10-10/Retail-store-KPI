const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000';

async function testBillingEmailLive() {
  console.log('\n🧪 LIVE TEST: Billing Email Notification\n');
  console.log('This will create a real bill and trigger email notification\n');
  
  try {
    // Step 1: Login as cashier
    console.log('1️⃣  Logging in as cashier...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'cashier1',
      password: 'cashier123'
    });
    
    const token = loginResponse.data.token;
    console.log('   ✅ Logged in successfully\n');
    
    // Step 2: Get products
    console.log('2️⃣  Fetching products...');
    const productsResponse = await axios.get(`${BASE_URL}/api/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const products = productsResponse.data.products;
    console.log(`   ✅ Found ${products.length} products\n`);
    
    // Step 3: Find Butter (good stock, easy to test)
    const butter = products.find(p => p.name === 'Butter');
    
    if (!butter) {
      console.log('   ❌ Butter not found, using first product\n');
      return;
    }
    
    console.log('3️⃣  Product Selected for Testing:');
    console.log(`   📦 Product: ${butter.name}`);
    console.log(`   📊 Current Stock: ${butter.stock_quantity} units`);
    console.log(`   🎯 Threshold: ${butter.min_stock_threshold || 10} units`);
    
    // Calculate how many to buy to drop below threshold
    const threshold = butter.min_stock_threshold || 10;
    const quantityToBuy = butter.stock_quantity - threshold + 1;
    
    console.log(`   🛒 Will Buy: ${quantityToBuy} units`);
    console.log(`   📉 New Stock Will Be: ${butter.stock_quantity - quantityToBuy} units`);
    console.log(`   ⚠️  This WILL trigger low stock alert!\n`);
    
    // Step 4: Create the bill
    console.log('4️⃣  Creating bill...');
    console.log('   ⏳ Waiting for response...\n');
    
    const billResponse = await axios.post(`${BASE_URL}/api/billing`, {
      items: [
        {
          product_id: butter.id,
          quantity: quantityToBuy
        }
      ]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('   ✅ Bill created successfully!');
    console.log(`   💰 Bill Number: ${billResponse.data.bill.bill_number}`);
    console.log(`   💵 Total Amount: ₹${billResponse.data.bill.total_amount.toFixed(2)}\n`);
    
    // Step 5: Wait a moment for async email processing
    console.log('5️⃣  Waiting for email to be sent...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('   ⏱️  2 seconds elapsed\n');
    
    console.log('6️⃣  CHECK BACKEND CONSOLE NOW!');
    console.log('   You should see:');
    console.log(`   ⚠️ BILLING ALERT: "${butter.name}" dropped to ${butter.stock_quantity - quantityToBuy} units`);
    console.log(`   📧 Low stock alert sent to suryasaketh76@gmail.com for ${butter.name}\n`);
    
    console.log('7️⃣  CHECK YOUR EMAIL!');
    console.log('   📬 Email sent to: suryasaketh76@gmail.com');
    console.log('   📧 Subject: Stock Alert – "' + butter.name + '" is running low');
    console.log('   📁 Check: Inbox, Spam, Promotions tabs');
    console.log('   ⏱️  May take 1-3 minutes to arrive\n');
    
    console.log('✅ TEST COMPLETE!\n');
    console.log('If you see the BILLING ALERT in backend console, the email WAS sent.');
    console.log('If you don\'t see it in your inbox, check SPAM folder!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data?.error || error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testBillingEmailLive();
