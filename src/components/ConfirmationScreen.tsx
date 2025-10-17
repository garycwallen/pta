import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import thumbsUpUrl from '../assets/thumbs_up.png';

interface ConfirmationData {
  type: 'rsvp' | 'walkIn';
  name?: string;
  attendeeCount?: number;
  gradeLevels?: string;
  lastName?: string;
  adults?: number;
  kids?: number;
  kidGrades?: string[];
}

interface ConfirmationScreenProps {
  data: ConfirmationData;
  onTimeout: () => void;
}

export default function ConfirmationScreen({ data, onTimeout }: ConfirmationScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onTimeout();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onTimeout]);

  const renderMessage = () => {
    if (data.type === 'rsvp' && data.name) {
      return `Welcome ${data.name}! Thank you for checking in. ${data.attendeeCount} ${
        data.attendeeCount === 1 ? 'person' : 'people'
      } attending${
        data.gradeLevels ? ` (Grades: ${data.gradeLevels})` : ''
      }. Please proceed to the registration desk.`;
    }
    
    if (data.type === 'rsvp') {
      return 'Thank you for RSVPing. Please proceed to the registration desk.';
    }
    
    // Walk-in message
    const totalAttendees = (data.adults || 0) + (data.kids || 0);
    return `Thank you for registering ${totalAttendees} ${
      totalAttendees === 1 ? 'attendee' : 'attendees'
    } (${data.adults || 0} adults, ${data.kids || 0} kids${
      data.kids && data.kidGrades && data.kidGrades.length > 0
        ? ` in grades: ${data.kidGrades.join(', ')}`
        : ''
    }). Please see our staff for check-in.`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-8">
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm shadow-2xl border-0">
        <CardContent className="p-12 text-center">
          <img src={thumbsUpUrl} alt="Thumbs up" className="w-100 h-100 mx-auto mb-6" />
          
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            {data.type === 'rsvp' ? 'Welcome!' : 'Welcome Walk-ins!'}
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {renderMessage()}
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