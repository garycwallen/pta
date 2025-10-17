import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, BarChart3 } from 'lucide-react';

interface MainKioskScreenProps {
  onSelection: (choice: 'yes' | 'no') => void;
  onAdminClick: () => void;
  isSubmitting?: boolean;
}

export default function MainKioskScreen({ onSelection, onAdminClick, isSubmitting = false }: MainKioskScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-yellow-400 flex items-center justify-center p-8 relative">
      {/* Small Admin Stats Icon - Top Right Corner */}
      <button
        onClick={onAdminClick}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 opacity-50 hover:opacity-100"
        title="Admin Stats"
      >
        <BarChart3 className="w-5 h-5 text-white" />
      </button>

      <div className="w-full max-w-4xl">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="p-16 text-center">
            <h1 className="text-6xl font-bold text-gray-800 mb-12 leading-tight">
              Did you RSVP?
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <Button
                onClick={() => onSelection('yes')}
                disabled={isSubmitting}
                size="lg"
                className="h-32 text-3xl font-semibold bg-green-600 hover:bg-green-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-xl disabled:opacity-50"
              >
                <CheckCircle className="w-10 h-10 mr-4" />
                {isSubmitting ? 'Processing...' : 'Yes'}
              </Button>
              
              <Button
                onClick={() => onSelection('no')}
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