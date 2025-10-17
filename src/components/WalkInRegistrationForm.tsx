import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Users, Baby, Plus, Minus } from 'lucide-react';

interface WalkInData {
  lastName: string;
  adults: number;
  kids: number;
  kidGrades: string[];
  email?: string;
}

interface WalkInRegistrationFormProps {
  onSubmit: (data: WalkInData) => void;
  onBack: () => void;
}

export default function WalkInRegistrationForm({ onSubmit, onBack }: WalkInRegistrationFormProps) {
  const [lastName, setLastName] = useState('');
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [kidGrades, setKidGrades] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update kidGrades array when kids count changes
  useEffect(() => {
    setKidGrades(prev => {
      const newGrades = [...prev];
      if (newGrades.length > kids) {
        return newGrades.slice(0, kids);
      }
      while (newGrades.length < kids) {
        newGrades.push('Pre-K');
      }
      return newGrades;
    });
  }, [kids]);

  const incrementAdults = () => setAdults(prev => Math.min(prev + 1, 20));
  const decrementAdults = () => setAdults(prev => Math.max(prev - 1, 0));
  const incrementKids = () => setKids(prev => Math.min(prev + 1, 20));
  const decrementKids = () => setKids(prev => Math.max(prev - 1, 0));

  const updateKidGrade = (index: number, grade: string) => {
    setKidGrades(prev => {
      const newGrades = [...prev];
      newGrades[index] = grade;
      return newGrades;
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        lastName: lastName.trim(),
        adults,
        kids,
        kidGrades,
        email: email.trim() || undefined
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAttendees = adults + kids;
  const canSubmit = totalAttendees > 0 && lastName.trim().length > 0;

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
                Please provide your information
              </p>
            </div>

            {/* Last Name Input */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
                Last Name *
              </h3>
              <div className="max-w-md mx-auto">
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Enter your last name"
                  className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50"
                  required
                />
              </div>
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

            {/* Email Input - Commented out for now, no current use case */}
            {/* <div className="mb-12">
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
            </div> */}

            {/* Action Buttons */}
            <div className="flex space-x-4 justify-center">
              <Button
                onClick={onBack}
                variant="outline"
                size="lg"
                disabled={isSubmitting}
                className="px-8 py-4 text-lg border-2 hover:bg-gray-50 disabled:opacity-50"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
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