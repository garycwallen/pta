import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, ArrowLeft, Users, Baby, Plus, Minus } from 'lucide-react';

// API Client
import { apiClient } from '@/services/apiClient';

// Lucky Images
// Thumbs Up
import thumbsUpUrl from "./assets/thumbs_up.png"

export default function EventCheckinKiosk() {
  const [selection, setSelection] = useState<string | null>(null);
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [kidGrades, setKidGrades] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-redirect effect for confirmation screens
  useEffect(() => {
    if (selection) {
      const timer = setTimeout(() => {
        setSelection(null);
        setShowWalkInForm(false);
        setAdults(1);
        setKids(0);
        setKidGrades([]);
        setEmail('');
        setIsSubmitting(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [selection]);

  // Update kidGrades array when kids count changes
  useEffect(() => {
    setKidGrades(prev => {
      const newGrades = [...prev];
      // If we have fewer kids now, trim the array
      if (newGrades.length > kids) {
        return newGrades.slice(0, kids);
      }
      // If we have more kids now, add default grades
      while (newGrades.length < kids) {
        newGrades.push('Pre-K');
      }
      return newGrades;
    });
  }, [kids]);

  const handleSelection = async (choice: string) => {
    if (choice === 'yes') {
      setIsSubmitting(true);
      try {
        // Call the API to create RSVP confirmation
        console.log('🎉 Submitting RSVP confirmation...');
        await apiClient.createRsvpConfirmation();
        console.log('✅ RSVP confirmation successful!');
        setSelection(choice);
      } catch (error) {
        console.error('❌ RSVP confirmation failed:', error);
        // Still show confirmation screen even if API fails
        setSelection(choice);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Show walk-in form for "no" responses
      setShowWalkInForm(true);
    }
  };

  const handleWalkInSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Prepare the data for API call
      const walkInData = {
        adults,
        kids,
        kidGrades,
        email: email.trim() || undefined
      };

      console.log('📝 Submitting walk-in registration:', walkInData);
      
      // Call the API to create walk-in registration
      await apiClient.createWalkInRegistration(walkInData);
      
      console.log('✅ Walk-in registration successful!');
      setSelection('no');
      setShowWalkInForm(false);
    } catch (error) {
      console.error('❌ Walk-in registration failed:', error);
      // Still show confirmation screen even if API fails
      setSelection('no');
      setShowWalkInForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSelection = () => {
    setSelection(null);
    setShowWalkInForm(false);
    setAdults(1);
    setKids(0);
    setKidGrades([]);
    setEmail('');
    setIsSubmitting(false);
  };

  const incrementAdults = () => setAdults(prev => Math.min(prev + 1, 20));
  const decrementAdults = () => setAdults(prev => Math.max(prev - 1, 0));
  const incrementKids = () => setKids(prev => Math.min(prev + 1, 20));
  const decrementKids = () => setKids(prev => Math.max(prev - 1, 0));

  // Function to update individual kid's grade
  const updateKidGrade = (index: number, grade: string) => {
    setKidGrades(prev => {
      const newGrades = [...prev];
      newGrades[index] = grade;
      return newGrades;
    });
  };

  // Walk-in Registration Form
  if (showWalkInForm) {
    const totalAttendees = adults + kids;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-8">
        <div className="w-full max-w-3xl">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
            <CardContent className="p-12">
              <div className="text-center mb-8">
                <h1 className="text-5xl font-bold text-gray-800 mb-4">
                  Walk-in Registration
                </h1>
                <p className="text-xl text-gray-600">
                  How many people will be attending?
                </p>
              </div>

              {/* Total Counter */}
              <div className="text-center mb-12">
                <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-lg">
                  <p className="text-lg font-medium">Total Attendees</p>
                  <p className="text-6xl font-bold">{totalAttendees}</p>
                </div>
              </div>

              {/* Adults Counter */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-700 mb-4 text-center flex items-center justify-center">
                  <Users className="w-6 h-6 mr-2" />
                  Adults
                </h3>
                <div className="flex items-center justify-center space-x-6">
                  <Button
                    onClick={decrementAdults}
                    disabled={adults <= 0 || isSubmitting}
                    size="lg"
                    variant="outline"
                    className="w-16 h-16 rounded-full text-2xl font-bold border-2 hover:bg-red-50 hover:border-red-300 disabled:opacity-30"
                  >
                    <Minus className="w-8 h-8" />
                  </Button>
                  
                  <div className="bg-gray-100 px-8 py-4 rounded-xl min-w-[120px] text-center">
                    <span className="text-4xl font-bold text-gray-800">{adults}</span>
                  </div>
                  
                  <Button
                    onClick={incrementAdults}
                    disabled={adults >= 20 || isSubmitting}
                    size="lg"
                    variant="outline"
                    className="w-16 h-16 rounded-full text-2xl font-bold border-2 hover:bg-green-50 hover:border-green-300 disabled:opacity-30"
                  >
                    <Plus className="w-8 h-8" />
                  </Button>
                </div>
              </div>

              {/* Kids Counter and Grade Selection */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-700 mb-4 text-center flex items-center justify-center">
                  <Baby className="w-6 h-6 mr-2" />
                  Children
                </h3>
                <div className="flex items-center justify-center space-x-6 mb-6">
                  <Button
                    onClick={decrementKids}
                    disabled={kids <= 0 || isSubmitting}
                    size="lg"
                    variant="outline"
                    className="w-16 h-16 rounded-full text-2xl font-bold border-2 hover:bg-red-50 hover:border-red-300 disabled:opacity-30"
                  >
                    <Minus className="w-8 h-8" />
                  </Button>
                  
                  <div className="bg-gray-100 px-8 py-4 rounded-xl min-w-[120px] text-center">
                    <span className="text-4xl font-bold text-gray-800">{kids}</span>
                  </div>
                  
                  <Button
                    onClick={incrementKids}
                    disabled={kids >= 20 || isSubmitting}
                    size="lg"
                    variant="outline"
                    className="w-16 h-16 rounded-full text-2xl font-bold border-2 hover:bg-green-50 hover:border-green-300 disabled:opacity-30"
                  >
                    <Plus className="w-8 h-8" />
                  </Button>
                </div>

                {/* Grade Selection for Each Kid */}
                {kids > 0 && (
                  <div className="space-y-4 max-w-2xl mx-auto">
                    <h4 className="text-lg font-medium text-gray-600 text-center mb-4">
                      Select grade for each child:
                    </h4>
                    {Array.from({ length: kids }, (_, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <span className="text-lg font-medium text-gray-700">
                          Child {index + 1}:
                        </span>
                        <select
                          value={kidGrades[index] || 'Pre-K'}
                          onChange={(e) => updateKidGrade(index, e.target.value)}
                          disabled={isSubmitting}
                          className="px-4 py-2 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white min-w-[120px] disabled:opacity-50"
                        >
                          <option value="Pre-K">Pre-K</option>
                          <option value="K">K</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                          <option value="6">6</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Email Input */}
              <div className="mb-12">
                <h3 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
                  Email Address (Optional)
                </h3>
                <div className="max-w-md mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Enter your email address"
                    className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 justify-center">
                <Button
                  onClick={resetSelection}
                  variant="outline"
                  size="lg"
                  disabled={isSubmitting}
                  className="px-8 py-4 text-lg border-2 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                
                <Button
                  onClick={handleWalkInSubmit}
                  disabled={totalAttendees === 0 || isSubmitting}
                  size="lg"
                  className="px-8 py-4 text-lg bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : `Register ${totalAttendees} ${totalAttendees === 1 ? 'Person' : 'People'}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Confirmation Screen
  if (selection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-8">
        <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="p-12 text-center">
            <img src={thumbsUpUrl} alt="Thumbs up" className="w-100 h-100 mx-auto mb-6" />
            
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              {selection === 'yes' ? 'Welcome!' : 'Welcome Walk-ins!'}
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {selection === 'yes' 
                ? 'Thank you for RSVPing. Please proceed to the registration desk.' 
                : `Thank you for registering ${adults + kids} ${adults + kids === 1 ? 'attendee' : 'attendees'} (${adults} adults, ${kids} kids${kids > 0 && kidGrades.length > 0 ? ` in grades: ${kidGrades.join(', ')}` : ''}). Please see our staff for check-in.`}
            </p>
            
            <div className="text-center">
              <div className="inline-block bg-blue-100 text-blue-800 px-6 py-3 rounded-full text-lg font-medium">
                Returning to main screen in 5 seconds...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Kiosk Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="p-16 text-center">
            <h1 className="text-6xl font-bold text-gray-800 mb-12 leading-tight">
              Did you RSVP?
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <Button
                onClick={() => handleSelection('yes')}
                disabled={isSubmitting}
                size="lg"
                className="h-32 text-3xl font-semibold bg-green-600 hover:bg-green-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-xl disabled:opacity-50"
              >
                <CheckCircle className="w-10 h-10 mr-4" />
                {isSubmitting ? 'Processing...' : 'Yes'}
              </Button>
              
              <Button
                onClick={() => handleSelection('no')}
                disabled={isSubmitting}
                size="lg"
                variant="outline"
                className="h-32 text-3xl font-semibold bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-xl disabled:opacity-50"
              >
                <XCircle className="w-10 h-10 mr-4" />
                No
              </Button>
            </div>
            
            <div className="mt-12 text-gray-500 text-lg">
              Touch a button to continue
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}