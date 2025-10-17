// importToSupabase.js
// Import Excel data to Supabase PostgreSQL
// Usage: node importToSupabase.js [excel-filename]

const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const excelFile = process.argv[2] || 'Test_RSVPLUCKYSAFARI091025.xlsx';

// Validation functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function cleanGradeLevels(gradeString) {
  if (!gradeString || typeof gradeString !== 'string') {
    return null;
  }
  return gradeString
    .replace(/Grade/gi, '')
    .replace(/,\s+/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

function validateAttendeeCount(count) {
  const num = parseInt(count);
  if (isNaN(num) || num < 1 || num > 50) {
    console.warn(`Invalid attendee count: ${count}, defaulting to 1`);
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

// Check environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  console.error('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Check if Excel file exists
if (!fs.existsSync(excelFile)) {
  console.error('Excel file not found:', excelFile);
  console.error('Make sure to place your Excel file in the API directory');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function importData() {
  try {
    // Read Excel file
    const workbook = XLSX.readFile(excelFile);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const rawData = XLSX.utils.sheet_to_json(worksheet, { 
      range: 1,
      header: ['name', 'email', 'attendee_count', 'grade_levels']
    });
    
    // Clear existing data
    const { error: deleteError } = await supabase
      .from('rsvp_families')
      .delete()
      .neq('id', 0);
    
    if (deleteError) {
      console.warn('Could not clear existing data:', deleteError.message);
    }
    
    // Process and validate records
    let successCount = 0;
    let skipCount = 0;
    const errors = [];
    const recordsToInsert = [];
    
    rawData.forEach((record, index) => {
      const rowNum = index + 3;
      
      try {
        const name = cleanName(record.name);
        const email = record.email ? String(record.email).trim() : '';
        const attendeeCount = validateAttendeeCount(record.attendee_count);
        const gradeLevels = cleanGradeLevels(record.grade_levels);
        
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
        
        recordsToInsert.push({
          name,
          email,
          attendee_count: attendeeCount,
          grade_levels: gradeLevels
        });
        
        successCount++;
        
      } catch (error) {
        errors.push(`Row ${rowNum}: ${error.message}`);
        skipCount++;
      }
    });
    
    // Batch insert into Supabase
    if (recordsToInsert.length > 0) {
      const { data, error: insertError } = await supabase
        .from('rsvp_families')
        .insert(recordsToInsert)
        .select();
      
      if (insertError) {
        throw insertError;
      }
    }
    
    // Get final statistics
    const { count, error: countError } = await supabase
      .from('rsvp_families')
      .select('*', { count: 'exact', head: true });
    
    if (countError) throw countError;
    
    const { data: attendeeData, error: attendeeError } = await supabase
      .from('rsvp_families')
      .select('attendee_count');
    
    if (attendeeError) throw attendeeError;
    
    const totalAttendees = attendeeData.reduce((sum, r) => sum + r.attendee_count, 0);
    
    // Final summary
    console.info('═'.repeat(50));
    console.info('✅ Import Complete!');
    console.info(`📊 Successfully imported: ${successCount} families`);
    if (skipCount > 0) {
      console.warn(`⚠️  Skipped: ${skipCount} records`);
    }
    console.info(`📈 Total in database: ${count} families`);
    console.info(`👥 Expected attendees: ${totalAttendees}`);
    console.info('═'.repeat(50));
    
    // Show errors if any
    if (errors.length > 0) {
      console.error('\nErrors encountered:');
      errors.forEach(error => console.error(`  ${error}`));
    }
    
  } catch (error) {
    console.error('\n💥 Import failed:', error.message);
    console.error('Check that:');
    console.error('  - Supabase credentials are correct in .env');
    console.error('  - Database tables exist (run schema SQL first)');
    console.error('  - Excel file exists and is not open');
    process.exit(1);
  }
}

// Run the import
importData();