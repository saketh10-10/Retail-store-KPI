#!/usr/bin/env node

/**
 * Pre-Push Verification Script
 * Run this before pushing to GitHub to ensure no sensitive data is committed
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🔍 Running Pre-Push Verification...\n');

let hasErrors = false;

// Check 1: Verify .env is in .gitignore
console.log('1. Checking .gitignore...');
try {
  const result = execSync('git check-ignore backend/.env', { encoding: 'utf8' }).trim();
  if (result === 'backend/.env') {
    console.log('   ✅ backend/.env is properly ignored\n');
  } else {
    console.log('   ❌ backend/.env is NOT ignored!\n');
    hasErrors = true;
  }
} catch (error) {
  console.log('   ❌ backend/.env is NOT in .gitignore!\n');
  hasErrors = true;
}

// Check 2: Verify .env.example has placeholders
console.log('2. Checking .env.example...');
const envExample = fs.readFileSync(path.join(__dirname, 'backend', '.env.example'), 'utf8');
if (envExample.includes('your-email@gmail.com') && envExample.includes('your-gmail-app-password')) {
  console.log('   ✅ .env.example has placeholders\n');
} else {
  console.log('   ❌ .env.example might contain real credentials!\n');
  hasErrors = true;
}

// Check 3: Search for actual sensitive data (not placeholders)
console.log('3. Searching for sensitive data in tracked files...');
const sensitivePatterns = [
  'suryasaketh76@gmail.com',
  'suryasaketh12@gmail.com',
  'rdaq durk ahat jpqq',
];

let foundSensitive = false;
for (const pattern of sensitivePatterns) {
  try {
    const result = execSync(`git grep -i "${pattern}"`, { encoding: 'utf8' });
    if (result) {
      console.log(`   ❌ Found sensitive pattern "${pattern}" in tracked files:`);
      console.log(result);
      foundSensitive = true;
    }
  } catch (error) {
    // No matches found (exit code 1), which is good
  }
}

if (!foundSensitive) {
  console.log('   ✅ No sensitive data found in tracked files\n');
} else {
  console.log('   ❌ Sensitive data found! Remove before pushing.\n');
  hasErrors = true;
}

// Check 4: Verify database files are ignored
console.log('4. Checking database files...');
try {
  const result = execSync('git check-ignore backend/database/*.db', { encoding: 'utf8' }).trim();
  if (result.includes('.db')) {
    console.log('   ✅ Database files are properly ignored\n');
  } else {
    console.log('   ⚠️  Database files might not be ignored\n');
  }
} catch (error) {
  console.log('   ⚠️  Database files might not be ignored\n');
}

// Check 5: Verify essential files exist
console.log('5. Checking essential files...');
const essentialFiles = [
  'README.md',
  'SETUP_GUIDE.md',
  'backend/.env.example',
  '.gitignore',
];

let allFilesExist = true;
for (const file of essentialFiles) {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`   ✅ ${file} exists`);
  } else {
    console.log(`   ❌ ${file} is missing!`);
    allFilesExist = false;
    hasErrors = true;
  }
}
console.log('');

// Final result
console.log('═'.repeat(50));
if (hasErrors) {
  console.log('❌ VERIFICATION FAILED!');
  console.log('Please fix the issues above before pushing to GitHub.\n');
  process.exit(1);
} else {
  console.log('✅ VERIFICATION PASSED!');
  console.log('Your repository is safe to push to GitHub.\n');
  console.log('Next steps:');
  console.log('  git add .');
  console.log('  git commit -m "Your commit message"');
  console.log('  git push origin main\n');
  process.exit(0);
}
