/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { statements } from '../database/database';

export interface WalkInRegistrationRequest {
  adults: number;
  kids: number;
  kidGrades: string[];
  email?: string;
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

// Create an RSVP confirmation
export const createRsvpConfirmation = (req: Request, res: Response) => {
  console.log('\n🎉 RSVP CONFIRMATION REQUEST RECEIVED');
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

// Get statistics
export const getStats = (req: Request, res: Response) => {
  console.log('\n📊 GET STATS REQUEST');
  console.log('📧 Request from:', req.ip);
  
  try {
    console.log('🔍 Querying database for walk-in stats...');
    const walkInStats = statements.getWalkInStats.get() as any;
    console.log('📈 Walk-in stats:', walkInStats);
    
    console.log('🔍 Querying database for RSVP count...');
    const rsvpCount = statements.getRsvpConfirmationCount.get() as any;
    console.log('📈 RSVP count:', rsvpCount);
    
    const stats = {
      walkIn: {
        registrations: walkInStats.total_registrations || 0,
        adults: walkInStats.total_adults || 0,
        kids: walkInStats.total_kids || 0,
        totalAttendees: walkInStats.total_attendees || 0
      },
      rsvp: {
        confirmations: rsvpCount.count || 0
      },
      total: {
        registrations: (walkInStats.total_registrations || 0) + (rsvpCount.count || 0),
        attendees: (walkInStats.total_attendees || 0) + (rsvpCount.count || 0)
      }
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