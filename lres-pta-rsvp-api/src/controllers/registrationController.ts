/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { statements } from '../database/database';

export interface WalkInRegistrationRequest {
  adults: number;
  kids: number;
  kidGrades: string[];
  email?: string;
}

export interface RsvpFamilyRequest {
  name: string; // Column A: Contact person's name
  email: string; // Column B: Email address
  attendee_count: number; // Column C: Number of attendees
  grade_levels?: string; // Column D: Student grade levels (comma-separated)
}

export interface RsvpCheckInRequest {
  rsvpFamilyId: number;
}

// Create a walk-in registration
export const createWalkInRegistration = (req: Request, res: Response) => {
  console.log('\n🔥 WALK-IN REGISTRATION REQUEST RECEIVED');
  console.log('📧 Request from:', req.ip);
  console.log('📨 Raw request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { adults, kids, kidGrades, email }: WalkInRegistrationRequest = req.body;
    
    console.log('📋 Parsed data:');
    console.log('  - Adults:', adults);
    console.log('  - Kids:', kids);
    console.log('  - Kid Grades:', kidGrades);
    console.log('  - Email:', email || 'Not provided');
    
    // Validation
    if (typeof adults !== 'number' || adults < 0) {
      console.log('❌ Validation failed: Invalid adults value');
      return res.status(400).json({ error: 'Adults must be a non-negative number' });
    }
    if (typeof kids !== 'number' || kids < 0) {
      console.log('❌ Validation failed: Invalid kids value');
      return res.status(400).json({ error: 'Kids must be a non-negative number' });
    }
    if (!Array.isArray(kidGrades)) {
      console.log('❌ Validation failed: kidGrades is not an array');
      return res.status(400).json({ error: 'kidGrades must be an array' });
    }

    const totalAttendees = adults + kids;
    console.log('👥 Total attendees calculated:', totalAttendees);
    
    if (totalAttendees === 0) {
      console.log('❌ Validation failed: No attendees');
      return res.status(400).json({ error: 'Total attendees must be greater than 0' });
    }

    const kidGradesJson = kidGrades.length > 0 ? JSON.stringify(kidGrades) : null;
    console.log('📝 Kid grades JSON for database:', kidGradesJson);
    
    console.log('💾 Attempting to insert into database...');
    const result = statements.insertWalkInRegistration.run(
      adults,
      kids,
      kidGradesJson,
      email || null,
      totalAttendees
    );
    
    console.log('✅ DATABASE INSERT SUCCESSFUL!');
    console.log('🆔 New record ID:', result.lastInsertRowid);
    console.log('📊 Changes made:', result.changes);

    const responseData = {
      success: true,
      id: result.lastInsertRowid,
      data: {
        adults,
        kids,
        kidGrades,
        email,
        totalAttendees
      }
    };
    
    console.log('📤 Sending response:', JSON.stringify(responseData, null, 2));
    console.log('🔚 Walk-in registration completed successfully!\n');
    
    res.status(201).json(responseData);
  } catch (error) {
    console.log('💥 ERROR in createWalkInRegistration:');
    console.error(error);
    console.log('📤 Sending error response\n');
    res.status(500).json({ error: 'Failed to create registration' });
  }
};

// Get all RSVP families (available for check-in)
export const getRsvpFamilies = (req: Request, res: Response) => {
  console.log('\n👨‍👩‍👧‍👦 GET RSVP FAMILIES REQUEST');
  console.log('📧 Request from:', req.ip);
  
  try {
    console.log('🔍 Querying database for RSVP families...');
    const families = statements.getAllRsvpFamilies.all();
    console.log(`👥 Found ${families.length} RSVP families in database`);
   
    console.log('📤 Sending families data');
    console.log('🔚 Get RSVP families completed successfully!\n');

    res.json({
      success: true,
      data: families
    });
  } catch (error) {
    console.log('💥 ERROR in getRsvpFamilies:');
    console.error(error);
    console.log('📤 Sending error response\n');
    res.status(500).json({ error: 'Failed to fetch RSVP families' });
  }
};

// Process RSVP check-in (move family from rsvp_families to rsvp_check_ins)
export const processRsvpCheckIn = (req: Request, res: Response) => {
  console.log('\n🎯 RSVP CHECK-IN REQUEST RECEIVED');
  console.log('📧 Request from:', req.ip);
  console.log('📨 Raw request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { rsvpFamilyId }: RsvpCheckInRequest = req.body;
    
    console.log('📋 Processing check-in for family ID:', rsvpFamilyId);
    
    // Validation
    if (!rsvpFamilyId || typeof rsvpFamilyId !== 'number') {
      console.log('❌ Validation failed: Invalid family ID');
      return res.status(400).json({ error: 'Valid family ID is required' });
    }

    // Get the family data first
    console.log('🔍 Looking up family data...');
    const family = statements.getRsvpFamilyById.get(rsvpFamilyId) as any;
    
    if (!family) {
      console.log('❌ Family not found with ID:', rsvpFamilyId);
      return res.status(404).json({ error: 'Family not found or already checked in' });
    }

    console.log('👥 Found family:', family.name);
    console.log('📊 Family details:', {
      attendeeCount: family.attendee_count,
      gradeLevels: family.grade_levels
    });

    // Insert into check-ins table
    console.log('💾 Recording check-in...');
    const checkInResult = statements.insertRsvpCheckIn.run(
      family.id,
      family.name,
      family.email,
      family.attendee_count,
      family.grade_levels
    );

    console.log('✅ Check-in recorded with ID:', checkInResult.lastInsertRowid);

    // Remove from RSVP families table
    console.log('🗑️ Removing family from available RSVP list...');
    const deleteResult = statements.deleteRsvpFamily.run(rsvpFamilyId);
    console.log('📊 Families removed:', deleteResult.changes);

    const responseData = {
      success: true,
      checkInId: checkInResult.lastInsertRowid,
      data: {
        name: family.name,
        email: family.email,
        attendeeCount: family.attendee_count,
        gradeLevels: family.grade_levels
      }
    };
    
    console.log('📤 Sending response:', JSON.stringify(responseData, null, 2));
    console.log('🔚 RSVP check-in completed successfully!\n');
    
    res.status(201).json(responseData);
  } catch (error) {
    console.log('💥 ERROR in processRsvpCheckIn:');
    console.error(error);
    console.log('📤 Sending error response\n');
    res.status(500).json({ error: 'Failed to process RSVP check-in' });
  }
};

// Add RSVP family (for manual entry/admin purposes)
export const addRsvpFamily = (req: Request, res: Response) => {
  console.log('\n➕ ADD RSVP FAMILY REQUEST');
  console.log('📧 Request from:', req.ip);
  console.log('📨 Raw request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { name, email, attendee_count, grade_levels }: RsvpFamilyRequest = req.body;
    
    // Validation
    if (!name || !name.trim()) {
      console.log('❌ Validation failed: Missing name');
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!email || !email.trim()) {
      console.log('❌ Validation failed: Missing email');
      return res.status(400).json({ error: 'Email is required' });
    }
    if (typeof attendee_count !== 'number' || attendee_count <= 0) {
      console.log('❌ Validation failed: Invalid attendee count');
      return res.status(400).json({ error: 'Attendee count must be a positive number' });
    }

    console.log('👥 Attendee count:', attendee_count);
    console.log('📚 Grade levels:', grade_levels || 'None specified');
    
    console.log('💾 Attempting to insert RSVP family into database...');
    const result = statements.insertRsvpFamily.run(
      name.trim(),
      email.trim(),
      attendee_count,
      grade_levels ? grade_levels.trim() : null
    );
    
    console.log('✅ RSVP FAMILY ADDED SUCCESSFULLY!');
    console.log('🆔 New record ID:', result.lastInsertRowid);

    const responseData = {
      success: true,
      id: result.lastInsertRowid,
      data: {
        name: name.trim(),
        email: email.trim(),
        attendee_count,
        grade_levels: grade_levels || null
      }
    };
    
    console.log('📤 Sending response:', JSON.stringify(responseData, null, 2));
    console.log('🔚 Add RSVP family completed successfully!\n');
    
    res.status(201).json(responseData);
  } catch (error) {
    console.log('💥 ERROR in addRsvpFamily:');
    console.error(error);
    console.log('📤 Sending error response\n');
    res.status(500).json({ error: 'Failed to add RSVP family' });
  }
};

// Create an RSVP confirmation (legacy - keeping for compatibility)
export const createRsvpConfirmation = (req: Request, res: Response) => {
  console.log('\n🎉 LEGACY RSVP CONFIRMATION REQUEST RECEIVED');
  console.log('📧 Request from:', req.ip);
  console.log('📨 Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    console.log('💾 Attempting to insert RSVP confirmation into database...');
    const result = statements.insertRsvpConfirmation.run();
    
    console.log('✅ RSVP CONFIRMATION INSERTED SUCCESSFULLY!');
    console.log('🆔 New record ID:', result.lastInsertRowid);
    console.log('📊 Changes made:', result.changes);
    
    const responseData = {
      success: true,
      id: result.lastInsertRowid
    };
    
    console.log('📤 Sending response:', JSON.stringify(responseData, null, 2));
    console.log('🔚 RSVP confirmation completed successfully!\n');
    
    res.status(201).json(responseData);
  } catch (error) {
    console.log('💥 ERROR in createRsvpConfirmation:');
    console.error(error);
    console.log('📤 Sending error response\n');
    res.status(500).json({ error: 'Failed to create RSVP confirmation' });
  }
};

// Get all walk-in registrations
export const getWalkInRegistrations = (req: Request, res: Response) => {
  console.log('\n📋 GET WALK-IN REGISTRATIONS REQUEST');
  console.log('📧 Request from:', req.ip);
  
  try {
    console.log('🔍 Querying database for all walk-in registrations...');
    const registrations = statements.getAllWalkInRegistrations.all();
    console.log(`📊 Found ${registrations.length} registrations in database`);
   
    // Parse kid_grades JSON for each registration
    const parsedRegistrations = registrations.map((registration: any) => ({
      ...registration,
      kidGrades: registration.kid_grades ? JSON.parse(registration.kid_grades) : []
    }));
    
    console.log('🔄 Parsed registrations with kid grades');
    console.log('📤 Sending registrations data');
    console.log('🔚 Get registrations completed successfully!\n');

    res.json({
      success: true,
      data: parsedRegistrations
    });
  } catch (error) {
    console.log('💥 ERROR in getWalkInRegistrations:');
    console.error(error);
    console.log('📤 Sending error response\n');
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
};

// Get all RSVP check-ins
export const getRsvpCheckIns = (req: Request, res: Response) => {
  console.log('\n📋 GET RSVP CHECK-INS REQUEST');
  console.log('📧 Request from:', req.ip);
  
  try {
    console.log('🔍 Querying database for all RSVP check-ins...');
    const checkIns = statements.getAllRsvpCheckIns.all();
    console.log(`📊 Found ${checkIns.length} check-ins in database`);
   
    console.log('📤 Sending check-ins data');
    console.log('🔚 Get RSVP check-ins completed successfully!\n');

    res.json({
      success: true,
      data: checkIns
    });
  } catch (error) {
    console.log('💥 ERROR in getRsvpCheckIns:');
    console.error(error);
    console.log('📤 Sending error response\n');
    res.status(500).json({ error: 'Failed to fetch RSVP check-ins' });
  }
};

// Get statistics
export const getStats = (req: Request, res: Response) => {
  console.log('\n📊 GET STATS REQUEST');
  console.log('📧 Request from:', req.ip);
  
  try {
    console.log('🔍 Querying database for walk-in stats...');
    const walkInStats = statements.getWalkInStats.get() as any;
    console.log('📈 Walk-in stats:', walkInStats);
    
    console.log('🔍 Querying database for RSVP check-in stats...');
    const rsvpCheckInStats = statements.getRsvpCheckInStats.get() as any;
    console.log('📈 RSVP check-in stats:', rsvpCheckInStats);
    
    const stats = {
      walkIn: {
        registrations: walkInStats.total_registrations || 0,
        adults: walkInStats.total_adults || 0,
        kids: walkInStats.total_kids || 0,
        totalAttendees: walkInStats.total_attendees || 0,
      },
      rsvpCheckIns: {
        checkIns: rsvpCheckInStats.total_check_ins || 0,
        totalAttendees: rsvpCheckInStats.total_attendees || 0,
      },
      total: {
        registrations:
          (walkInStats.total_registrations || 0) +
          (rsvpCheckInStats.total_check_ins || 0),
        attendees:
          (walkInStats.total_attendees || 0) +
          (rsvpCheckInStats.total_attendees || 0),
      },
    };
    
    console.log('🧮 Calculated final stats:', JSON.stringify(stats, null, 2));
    console.log('📤 Sending stats response');
    console.log('🔚 Get stats completed successfully!\n');

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.log('💥 ERROR in getStats:');
    console.error(error);
    console.log('📤 Sending error response\n');
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};