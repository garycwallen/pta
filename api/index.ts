import express, { Request, Response } from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const app = express();

// Simple CORS - Allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.options('*', cors());

// Walk-in Registration - POST
app.post('/api/walk-in', async (req: Request, res: Response) => {
  try {
    const { lastName, adults, kids, kidGrades, email } = req.body;
    
    if (!lastName || !lastName.trim()) {
      return res.status(400).json({ error: 'Last name is required' });
    }
    if (typeof adults !== 'number' || adults < 0) {
      return res.status(400).json({ error: 'Adults must be a non-negative number' });
    }
    if (typeof kids !== 'number' || kids < 0) {
      return res.status(400).json({ error: 'Kids must be a non-negative number' });
    }
    if (!Array.isArray(kidGrades)) {
      return res.status(400).json({ error: 'kidGrades must be an array' });
    }

    const totalAttendees = adults + kids;
    
    if (totalAttendees === 0) {
      return res.status(400).json({ error: 'Total attendees must be greater than 0' });
    }

    const { data, error } = await supabase
      .from('walk_in_registrations')
      .insert({
        last_name: lastName.trim(),
        adults,
        kids,
        kid_grades: kidGrades.length > 0 ? kidGrades : null,
        email: email || null,
        total_attendees: totalAttendees
      })
      .select()
      .single();
    
    if (error) throw error;

    res.status(201).json({
      success: true,
      id: data.id,
      data: {
        lastName,
        adults,
        kids,
        kidGrades,
        email,
        totalAttendees
      }
    });
  } catch (error) {
    console.error('Error creating walk-in registration:', error);
    res.status(500).json({ error: 'Failed to create registration' });
  }
});

// Walk-in Registrations - GET
app.get('/api/walk-in', async (req: Request, res: Response) => {
  try {
    const { data: registrations, error } = await supabase
      .from('walk_in_registrations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
   
    const parsedRegistrations = (registrations || []).map((registration: any) => ({
      ...registration,
      kidGrades: registration.kid_grades || []
    }));

    res.json({
      success: true,
      data: parsedRegistrations
    });
  } catch (error) {
    console.error('Error fetching walk-in registrations:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// RSVP Families - GET
app.get('/api/rsvp-families', async (req: Request, res: Response) => {
  try {
    const { data: families, error } = await supabase
      .from('rsvp_families')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;

    res.json({
      success: true,
      data: families || []
    });
  } catch (error) {
    console.error('Error fetching RSVP families:', error);
    res.status(500).json({ error: 'Failed to fetch RSVP families' });
  }
});

// RSVP Families - POST
app.post('/api/rsvp-families', async (req: Request, res: Response) => {
  try {
    const { name, email, attendee_count, grade_levels } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (typeof attendee_count !== 'number' || attendee_count <= 0) {
      return res.status(400).json({ error: 'Attendee count must be a positive number' });
    }

    const { data, error } = await supabase
      .from('rsvp_families')
      .insert({
        name: name.trim(),
        email: email.trim(),
        attendee_count,
        grade_levels: grade_levels ? grade_levels.trim() : null
      })
      .select()
      .single();
    
    if (error) throw error;

    res.status(201).json({
      success: true,
      id: data.id,
      data: {
        name: name.trim(),
        email: email.trim(),
        attendee_count,
        grade_levels: grade_levels || null
      }
    });
  } catch (error) {
    console.error('Error adding RSVP family:', error);
    res.status(500).json({ error: 'Failed to add RSVP family' });
  }
});

// RSVP Check-in - POST
app.post('/api/rsvp-checkin', async (req: Request, res: Response) => {
  try {
    const { rsvpFamilyId } = req.body;
    
    if (!rsvpFamilyId || typeof rsvpFamilyId !== 'number') {
      return res.status(400).json({ error: 'Valid family ID is required' });
    }

    const { data: family, error: fetchError } = await supabase
      .from('rsvp_families')
      .select('*')
      .eq('id', rsvpFamilyId)
      .single();
    
    if (fetchError || !family) {
      console.warn(`Family not found with ID: ${rsvpFamilyId}`);
      return res.status(404).json({ error: 'Family not found or already checked in' });
    }

    const { data: checkIn, error: insertError } = await supabase
      .from('rsvp_check_ins')
      .insert({
        rsvp_family_id: family.id,
        name: family.name,
        email: family.email,
        attendee_count: family.attendee_count,
        grade_levels: family.grade_levels
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const { error: deleteError } = await supabase
      .from('rsvp_families')
      .delete()
      .eq('id', rsvpFamilyId);

    if (deleteError) throw deleteError;

    res.status(201).json({
      success: true,
      checkInId: checkIn.id,
      data: {
        name: family.name,
        email: family.email,
        attendeeCount: family.attendee_count,
        gradeLevels: family.grade_levels
      }
    });
  } catch (error) {
    console.error('Error processing RSVP check-in:', error);
    res.status(500).json({ error: 'Failed to process RSVP check-in' });
  }
});

// RSVP Check-ins - GET
app.get('/api/rsvp-checkins', async (req: Request, res: Response) => {
  try {
    const { data: checkIns, error } = await supabase
      .from('rsvp_check_ins')
      .select('*')
      .order('checked_in_at', { ascending: false });
    
    if (error) throw error;

    res.json({
      success: true,
      data: checkIns || []
    });
  } catch (error) {
    console.error('Error fetching RSVP check-ins:', error);
    res.status(500).json({ error: 'Failed to fetch RSVP check-ins' });
  }
});

// Statistics - GET
app.get('/api/stats', async (req: Request, res: Response) => {
  try {
    const { data: walkInData, error: walkInError } = await supabase
      .from('walk_in_registrations')
      .select('adults, kids, total_attendees');
    
    if (walkInError) throw walkInError;
    
    const walkInStats = {
      total_registrations: walkInData?.length || 0,
      total_adults: walkInData?.reduce((sum, r) => sum + (r.adults || 0), 0) || 0,
      total_kids: walkInData?.reduce((sum, r) => sum + (r.kids || 0), 0) || 0,
      total_attendees: walkInData?.reduce((sum, r) => sum + (r.total_attendees || 0), 0) || 0
    };
    
    const { data: checkInData, error: checkInError } = await supabase
      .from('rsvp_check_ins')
      .select('attendee_count');
    
    if (checkInError) throw checkInError;
    
    const rsvpCheckInStats = {
      total_check_ins: checkInData?.length || 0,
      total_attendees: checkInData?.reduce((sum, r) => sum + (r.attendee_count || 0), 0) || 0
    };
    
    const stats = {
      walkIn: {
        registrations: walkInStats.total_registrations,
        adults: walkInStats.total_adults,
        kids: walkInStats.total_kids,
        totalAttendees: walkInStats.total_attendees
      },
      rsvpCheckIns: {
        checkIns: rsvpCheckInStats.total_check_ins,
        totalAttendees: rsvpCheckInStats.total_attendees
      },
      total: {
        registrations: walkInStats.total_registrations + rsvpCheckInStats.total_check_ins,
        attendees: walkInStats.total_attendees + rsvpCheckInStats.total_attendees
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export for Vercel
export default app;