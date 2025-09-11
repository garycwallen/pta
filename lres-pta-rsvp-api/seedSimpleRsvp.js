// seedSimpleRsvp.js
// Simple script to add test RSVP families matching the Excel structure
// Usage: node seedSimpleRsvp.js

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'event-checkin.db');
console.log('Connecting to database at:', dbPath);

const db = new Database(dbPath);

// Sample RSVP families data matching Excel structure
const families = [
  {
    name: 'Erin Fickling',
    email: 'erinfickling@gmail.com',
    attendee_count: 3,
    grade_levels: 'First Grade, Fourth Grade'
  },
  {
    name: 'Marina Alejandra Ulecia',
    email: 'mulecia@oas.org',
    attendee_count: 6,
    grade_levels: 'Second Grade'
  },
  {
    name: 'Daniele',
    email: 'danicarolinamaia@hotmail.com',
    attendee_count: 2,
    grade_levels: 'First Grade'
  },
  {
    name: 'Kerry Kares',
    email: 'kerry.kares@gmail.com',
    attendee_count: 4,
    grade_levels: 'First Grade, Sixth Grade'
  },
  {
    name: 'Michael Saffa-Wuya',
    email: 'Ckamara2007@gmail.com',
    attendee_count: 5,
    grade_levels: 'First Grade, Third Grade'
  },
  {
    name: 'Saturn Arcese',
    email: 'saturnos88@gmail.com',
    attendee_count: 5,
    grade_levels: 'First Grade'
  },
  {
    name: 'Maureen Willis',
    email: 'maureen.bozeman@gmail.com',
    attendee_count: 2,
    grade_levels: 'Kindergarten'
  },
  {
    name: 'Anthony Lombard',
    email: 'dna2014vintage@gmail.com',
    attendee_count: 5,
    grade_levels: 'First Grade, Fourth Grade'
  }
];

// Prepare insert statement
const insertFamily = db.prepare(`
  INSERT INTO rsvp_families (name, email, attendee_count, grade_levels)
  VALUES (?, ?, ?, ?)
`);

console.log('\n🌱 Seeding RSVP families...');

try {
  // Clear existing RSVP families (optional - comment out if you want to keep existing data)
  console.log('🗑️  Clearing existing RSVP families...');
  db.exec('DELETE FROM rsvp_families');
  
  // Insert each family
  families.forEach((family, index) => {
    const result = insertFamily.run(
      family.name,
      family.email,
      family.attendee_count,
      family.grade_levels
    );
    
    console.log(`✅ Added: ${family.name} (ID: ${result.lastInsertRowid}) - ${family.attendee_count} attendees`);
  });
  
  // Verify the data
  const count = db.prepare('SELECT COUNT(*) as count FROM rsvp_families').get();
  console.log(`\n🎉 Successfully added ${count.count} RSVP families!`);
  
  // Show summary
  const summary = db.prepare(`
    SELECT 
      COUNT(*) as total_families,
      SUM(attendee_count) as total_attendees
    FROM rsvp_families
  `).get();
  
  console.log('\n📊 Summary:');
  console.log(`   Families: ${summary.total_families}`);
  console.log(`   Total Attendees: ${summary.total_attendees}`);
  
  // Show sample records
  console.log('\n📋 Sample records:');
  const samples = db.prepare('SELECT name, email, attendee_count, grade_levels FROM rsvp_families LIMIT 5').all();
  samples.forEach(sample => {
    console.log(`   ${sample.name}: ${sample.email} - ${sample.attendee_count} attendees (${sample.grade_levels})`);
  });
  
} catch (error) {
  console.error('❌ Error seeding families:', error);
} finally {
  db.close();
  console.log('\n🔒 Database connection closed.');
  console.log('\n🚀 You can now test the RSVP family selection in your app!');
  console.log('   Visit your kiosk and click "Yes" to see the family list.');
}