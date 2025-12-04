// autoImportExcel.js
// Fully automated Excel import script for RSVP data
// Usage: node autoImportExcel.js [excel-filename]

const Database = require('better-sqlite3');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(process.cwd(), 'data', 'event-checkin.db');
const excelFile = process.argv[2] || 'S&S 2025 RSVPs.xlsx';

console.log('🚀 Automated RSVP Excel Import');
console.log('📁 Excel file:', excelFile);
console.log('🗄️  Database:', dbPath);

// Validation and data processing functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function cleanGradeLevels(gradeString) {
  if (!gradeString || typeof gradeString !== 'string') {
    return null;
  }
  
  // Clean up the grade string
  return gradeString
    .replace(/Grade/gi, '') // Remove "Grade" text
    .replace(/,\s+/g, ', ') // Normalize spacing
    .replace(/\s+/g, ' ')   // Remove extra spaces
    .trim();
}

function validateAttendeeCount(count) {
  const num = parseInt(count);
  if (isNaN(num) || num < 1 || num > 50) {
    console.warn(`⚠️  Invalid attendee count: ${count}, defaulting to 1`);
    return 1;
  }
  return num;
}

function cleanName(name) {
  if (!name || typeof name !== 'string') {
    return null;
  }
  return name.trim().replace(/\s+/g, ' ');
}

// Check if Excel file exists
if (!fs.existsSync(excelFile)) {
  console.error('❌ Excel file not found:', excelFile);
  console.log('💡 Make sure to place your Excel file in the API directory');
  console.log('Usage: node autoImportExcel.js [excel-filename]');
  process.exit(1);
}

try {
  // Read Excel file
  console.log('\n📖 Reading Excel file...');
  const workbook = XLSX.readFile(excelFile);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON, starting from row 2 (skipping title row)
  const rawData = XLSX.utils.sheet_to_json(worksheet, { 
    range: 1, // Start from row 2 (headers)
    header: ['name', 'email', 'attendee_count', 'grade_levels']
  });
  
  console.log(`📊 Found ${rawData.length} records in Excel file`);
  
  // Connect to database
  console.log('\n🔌 Connecting to database...');
  const db = new Database(dbPath);
  
  // Clear existing data
  console.log('🗑️  Clearing existing RSVP data...');
  db.exec('DELETE FROM rsvp_families');
  db.exec('DELETE FROM rsvp_check_ins');
  
  // Prepare insert statement
  const insertFamily = db.prepare(`
    INSERT INTO rsvp_families (name, email, attendee_count, grade_levels)
    VALUES (?, ?, ?, ?)
  `);
  
  // Process and validate each record
  console.log('\n🔄 Processing and validating records...');
  let successCount = 0;
  let skipCount = 0;
  const errors = [];
  
  rawData.forEach((record, index) => {
    const rowNum = index + 3; // Actual Excel row number
    
    try {
      // Extract and clean data
      const name = cleanName(record.name);
      const email = record.email ? String(record.email).trim() : '';
      const attendeeCount = validateAttendeeCount(record.attendee_count);
      const gradeLevels = cleanGradeLevels(record.grade_levels);
      
      // Validation checks
      if (!name) {
        errors.push(`Row ${rowNum}: Missing or invalid name`);
        skipCount++;
        return;
      }
      
      if (!email || !validateEmail(email)) {
        errors.push(`Row ${rowNum}: Invalid email for ${name}`);
        skipCount++;
        return;
      }
      
      // Insert into database
      insertFamily.run(name, email, attendeeCount, gradeLevels);
      
      console.log(`✅ Row ${rowNum}: ${name} (${attendeeCount} attendees)`);
      successCount++;
      
    } catch (error) {
      errors.push(`Row ${rowNum}: ${error.message}`);
      skipCount++;
    }
  });
  
  // Final summary
  const finalCount = db.prepare('SELECT COUNT(*) as count FROM rsvp_families').get();
  const totalAttendees = db.prepare('SELECT SUM(attendee_count) as total FROM rsvp_families').get();
  
  console.log('\n🎉 Import Complete!');
  console.log('═'.repeat(50));
  console.log(`✅ Successfully imported: ${successCount} families`);
  console.log(`⚠️  Skipped (errors): ${skipCount} records`);
  console.log(`📊 Total in database: ${finalCount.count} families`);
  console.log(`👥 Expected attendees: ${totalAttendees.total}`);
  
  // Show errors if any
  if (errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    errors.forEach(error => console.log(`   ${error}`));
  }
  
  // Show sample of imported data
  console.log('\n📋 Sample imported records:');
  const samples = db.prepare('SELECT name, email, attendee_count, grade_levels FROM rsvp_families ORDER BY name LIMIT 5').all();
  samples.forEach(sample => {
    console.log(`   📝 ${sample.name} (${sample.email})`);
    console.log(`      👥 ${sample.attendee_count} attendees | 🎓 ${sample.grade_levels || 'No grades'}`);
  });
  
  db.close();
  
  console.log('\n🚀 Ready for your event!');
  console.log('💡 Restart your server with: npm run dev');
  console.log('🔍 Test by clicking "Yes" on your kiosk to see all families');
  
} catch (error) {
  console.error('\n💥 Import failed:', error);
  console.log('🔧 Check that:');
  console.log('   - Excel file exists and is not open in another program');
  console.log('   - Database directory exists');
  console.log('   - You have the xlsx package installed: npm install xlsx');
  process.exit(1);
}