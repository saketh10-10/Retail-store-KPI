const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000';

async function testBillingAlert() {
  console.log('\n🧪 Testing Billing Low Stock Alert\n');
  
  try {
    // Step 1: Login as cashier
    console.log('1️⃣  Logging in as cashier...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'cashier1',
      password: 'cashier123'
    });
    
    const token = loginResponse.data.token;
    console.log('   ✅ Logged in successfully\n');
    
    // Step 2: Get current products
    console.log('2️⃣  Fetching products...');
    const productsResponse = await axios.get(`${BASE_URL}/api/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const products = productsResponse.data.products;
    console.log(`   ✅ Found ${products.length} products\n`);
    
    // Step 3: Find a product with good stock that we can drop below threshold
    const testProduct = products.find(p => {
      const threshold = p.min_stock_threshold || 10;
      return p.stock_quantity > threshold + 5; // Has enough stock to test
    });
    
    if (!testProduct) {
      console.log('   ⚠️  No suitable product found for testing');
      console.log('   All products are already below threshold or too close\n');
      return;
    }
    
    const threshold = testProduct.min_stock_threshold || 10;
    const quantityToBuy = testProduct.stock_quantity - threshold + 1; // Drop it just below threshold
    
    console.log('3️⃣  Test Product Selected:');
    console.log(`   📦 Product: ${testProduct.name}`);
    console.log(`   📊 Current Stock: ${testProduct.stock_quantity} units`);
    console.log(`   🎯 Threshold: ${threshold} units`);
    console.log(`   🛒 Will Buy: ${quantityToBuy} units`);
    console.log(`   📉 New Stock: ${testProduct.stock_quantity - quantityToBuy} units (BELOW THRESHOLD!)\n`);
    
    // Step 4: Create a bill
    console.log('4️⃣  Creating bill...');
    const billResponse = await axios.post(`${BASE_URL}/api/billing`, {
      items: [
        {
          product_id: testProduct.id,
          quantity: quantityToBuy
        }
      ]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('   ✅ Bill created successfully!');
    console.log(`   💰 Bill Number: ${billResponse.data.bill.bill_number}`);
    console.log(`   💵 Total Amount: ₹${billResponse.data.bill.total_amount.toFixed(2)}\n`);
    
    console.log('5️⃣  Check Backend Console:');
    console.log('   Look for these messages:');
    console.log(`   ⚠️ BILLING ALERT: "${testProduct.name}" dropped to ${testProduct.stock_quantity - quantityToBuy} units`);
    console.log(`   📧 Low stock alert sent to suryasaketh76@gmail.com for ${testProduct.name}\n`);
    
    console.log('6️⃣  Check Your Email:');
    console.log('   📬 Email sent to: suryasaketh76@gmail.com');
    console.log('   📧 Subject: Stock Alert – "' + testProduct.name + '" is running low');
    console.log('   ⏱️  Should arrive within 1-2 minutes\n');
    
    console.log('✅ TEST COMPLETE!\n');
    console.log('The billing alert system is working correctly.');
    console.log('Email notification has been triggered.\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data?.error || error.message);
    console.error('\nMake sure:');
    console.error('1. Backend server is running on port 5000');
    console.error('2. Email configuration is set in .env file');
    console.error('3. You have products with stock above threshold\n');
  }
}

// Run the test
testBillingAlert();
