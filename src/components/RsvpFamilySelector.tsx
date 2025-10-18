/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Users, Search, CheckCircle } from 'lucide-react';
import { apiClient, type RsvpFamily } from '@/services/apiClient';
import GradientLayout from './GradientLayout';

interface RsvpFamilySelectorProps {
  onBack: () => void;
  onCheckInComplete: (familyData: any) => void;
}

export default function RsvpFamilySelector({ onBack, onCheckInComplete }: RsvpFamilySelectorProps) {
  const [families, setFamilies] = useState<RsvpFamily[]>([]);
  const [filteredFamilies, setFilteredFamilies] = useState<RsvpFamily[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load RSVP families on component mount
  useEffect(() => {
    loadRsvpFamilies();
  }, []);

  // Filter families based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredFamilies(families);
    } else {
      const filtered = families.filter(family =>
        family.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        family.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFamilies(filtered);
    }
  }, [searchTerm, families]);

  const loadRsvpFamilies = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔍 Loading RSVP families...');
      
      const response = await apiClient.getRsvpFamilies();
      
      if (response.success && response.data) {
        console.log('✅ RSVP families loaded:', response.data.length);
        setFamilies(response.data);
      } else {
        throw new Error('Failed to load RSVP families');
      }
    } catch (error) {
      console.error('❌ Error loading RSVP families:', error);
      setError('Failed to load RSVP families. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async (family: RsvpFamily) => {
    try {
      setIsSubmitting(family.id);
      console.log('🎯 Processing check-in for family:', family.name);
      
      const response = await apiClient.processRsvpCheckIn({
        rsvpFamilyId: family.id
      });
      
      if (response.success) {
        console.log('✅ Check-in successful for:', family.name);
        // Remove the family from the list since they've checked in
        setFamilies(prev => prev.filter(f => f.id !== family.id));
        // Call the completion handler with the family data
        onCheckInComplete(response.data);
      } else {
        throw new Error('Check-in failed');
      }
    } catch (error) {
      console.error('❌ Check-in error:', error);
      setError(`Failed to check in ${family.name}. Please try again.`);
    } finally {
      setIsSubmitting(null);
    }
  };

  // Helper function to parse and format grade levels
  const formatGradeLevels = (gradeLevels?: string) => {
    if (!gradeLevels) return 'No grades specified';
    
    // Split by comma and clean up
    const grades = gradeLevels
      .split(',')
      .map(grade => grade.trim())
      .filter(grade => grade);
    
    if (grades.length === 0) return 'No grades specified';
    
    return grades.join(', ');
  };

  if (isLoading) {
    return (
      <GradientLayout>
        <div className="flex items-center justify-center p-8 min-h-screen">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-semibold text-gray-800">Loading RSVP Families...</h2>
            </CardContent>
          </Card>
        </div>
      </GradientLayout>
    );
  }

  return (
    <GradientLayout>
      <div className="flex items-center justify-center p-8 min-h-screen">
        <div className="w-full max-w-6xl">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  Select Your Family
                </h1>
                <p className="text-lg text-gray-600">
                  Find your family name and tap to check in
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                  <button 
                    onClick={() => setError(null)}
                    className="ml-4 text-red-800 hover:text-red-900 font-medium"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Search Box */}
              <div className="mb-8">
                <div className="relative max-w-md mx-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Family Count */}
              <div className="text-center mb-6">
                <p className="text-gray-600">
                  {filteredFamilies.length} {filteredFamilies.length === 1 ? 'family' : 'families'} available for check-in
                </p>
              </div>

              {/* Families List */}
              <div className="max-h-96 overflow-y-auto mb-8">
                {filteredFamilies.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-xl text-gray-500 mb-4">
                      {searchTerm ? 'No families found matching your search.' : 'No families available for check-in.'}
                    </p>
                    {searchTerm && (
                      <Button
                        onClick={() => setSearchTerm('')}
                        variant="outline"
                        className="mt-4"
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredFamilies.map((family) => (
                      <Card 
                        key={family.id} 
                        className="hover:shadow-lg transition-shadow duration-200 border-2 hover:border-blue-300"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                {family.name}
                              </h3>
                              
                              <p className="text-gray-600 mb-2">
                                Email: {family.email}
                              </p>
                              
                              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-2">
                                <div className="flex items-center">
                                  <Users className="w-4 h-4 mr-1" />
                                  {family.attendee_count} {family.attendee_count === 1 ? 'attendee' : 'attendees'}
                                </div>
                              </div>
                              
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Grade Levels: </span>
                                {formatGradeLevels(family.grade_levels)}
                              </div>
                            </div>
                            
                            <div className="ml-6">
                              <Button
                                onClick={() => handleCheckIn(family)}
                                disabled={isSubmitting !== null}
                                size="lg"
                                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg disabled:opacity-50"
                              >
                                {isSubmitting === family.id ? (
                                  <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Checking In...
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Check In
                                  </div>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Back Button */}
              <div className="text-center">
                <Button
                  onClick={onBack}
                  variant="outline"
                  size="lg"
                  disabled={isSubmitting !== null}
                  className="px-8 py-4 text-lg border-2 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Main Screen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </GradientLayout>
  );
}