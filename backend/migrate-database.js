const database = require('./database/connection');

async function migrate() {
  await database.connect();
  
  console.log('Running database migrations...\n');
  
  try {
    // Add min_stock_threshold column if it doesn't exist
    console.log('1. Adding min_stock_threshold column to products...');
    await database.run(`
      ALTER TABLE products ADD COLUMN min_stock_threshold INTEGER DEFAULT 10
    `).catch(() => {
      console.log('   ✅ Column already exists');
    });
    
    // Add view_count column if it doesn't exist
    console.log('2. Adding view_count column to products...');
    await database.run(`
      ALTER TABLE products ADD COLUMN view_count INTEGER DEFAULT 0
    `).catch(() => {
      console.log('   ✅ Column already exists');
    });
    
    console.log('\n✅ Migration complete!');
    
  } catch (error) {
    console.error('Migration error:', error);
  }
  
  await database.close();
  process.exit(0);
}

migrate();
