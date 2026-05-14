import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, UserCheck, UserPlus, BarChart3, ChevronRight } from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import GradientLayout from './GradientLayout';

interface CheckInRecord {
  id: number;
  name: string;
  email: string;
  attendee_count: number;
  checked_in_at: string;
}

interface WalkInRecord {
  id: number;
  last_name: string;
  adults: number;
  kids: number;
  kidGrades: string[];
  email: string | null;
  total_attendees: number;
  created_at: string;
}

interface AdminStatsPageProps {
  onClose: () => void;
}

interface StatsData {
  walkIn: {
    registrations: number;
    adults: number;
    kids: number;
    totalAttendees: number;
  };
  rsvpCheckIns: {
    checkIns: number;
    totalAttendees: number;
  };
  total: {
    registrations: number;
    attendees: number;
  };
}

export default function AdminStatsPage({ onClose }: AdminStatsPageProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [showCheckInList, setShowCheckInList] = useState(false);
  const [checkInList, setCheckInList] = useState<CheckInRecord[]>([]);
  const [isLoadingCheckIns, setIsLoadingCheckIns] = useState(false);
  const [showWalkInList, setShowWalkInList] = useState(false);
  const [walkInList, setWalkInList] = useState<WalkInRecord[]>([]);
  const [isLoadingWalkIns, setIsLoadingWalkIns] = useState(false);

  // Load stats on component mount and set up auto-refresh
  useEffect(() => {
    loadStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      setError(null);
      const response = await apiClient.getStats();
      
      if (response.success && response.data) {
        setStats(response.data);
        setLastUpdated(new Date());
      } else {
        throw new Error('Failed to load stats');
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      setError('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const openCheckInList = async () => {
    setShowCheckInList(true);
    setIsLoadingCheckIns(true);
    try {
      const response = await apiClient.getRsvpCheckIns();
      if (response.success && response.data) {
        setCheckInList(response.data);
      }
    } catch (err) {
      console.error('Error loading check-ins:', err);
    } finally {
      setIsLoadingCheckIns(false);
    }
  };

  const openWalkInList = async () => {
    setShowWalkInList(true);
    setIsLoadingWalkIns(true);
    try {
      const response = await apiClient.getWalkInRegistrations();
      if (response.success && response.data) {
        setWalkInList(response.data);
      }
    } catch (err) {
      console.error('Error loading walk-ins:', err);
    } finally {
      setIsLoadingWalkIns(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (isLoading && !stats) {
    return (
      <GradientLayout>
        <div className="flex items-center justify-center p-4 min-h-screen">
          <Card className="w-96 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg">Loading stats...</p>
            </CardContent>
          </Card>
        </div>
      </GradientLayout>
    );
  }

  return (
    <GradientLayout>
      <div className="flex items-center justify-center p-4 min-h-screen">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl w-full max-w-4xl max-h-screen overflow-y-auto border-0">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-800">Event Stats Dashboard</h1>
              </div>
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Last Updated */}
            <div className="text-sm text-gray-500 mb-6 text-center">
              Last updated: {formatTime(lastUpdated)} | Auto-refreshes every 30 seconds
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
                <Button
                  onClick={loadStats}
                  variant="outline"
                  size="sm"
                  className="ml-4"
                >
                  Retry
                </Button>
              </div>
            )}

            {stats && (
              <div className="space-y-6">
                {/* Total Attendees - Main Highlight */}
                <Card className="bg-gradient-to-r from-blue-500 to-yellow-500 text-white">
                  <CardContent className="p-8 text-center">
                    <h2 className="text-lg font-medium mb-2">Total People in Building</h2>
                    <p className="text-6xl font-bold">{stats.total.attendees}</p>
                    <p className="text-lg mt-2">from {stats.total.registrations} check-ins</p>
                  </CardContent>
                </Card>

                {/* Breakdown Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* RSVP Check-ins */}
                  <Card
                    className="border-green-200 bg-green-50 cursor-pointer hover:bg-green-100 transition-colors"
                    onClick={openCheckInList}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-green-800">RSVP Check-ins</h3>
                        <div className="flex items-center gap-1">
                          <UserCheck className="w-6 h-6 text-green-600" />
                          <ChevronRight className="w-4 h-4 text-green-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-3xl font-bold text-green-700">
                          {stats.rsvpCheckIns.totalAttendees}
                        </div>
                        <div className="text-sm text-green-600">
                          {stats.rsvpCheckIns.checkIns} families checked in
                        </div>
                        <div className="text-xs text-green-500 mt-1">Tap to view list</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Walk-in Registrations */}
                  <Card
                    className="border-orange-200 bg-orange-50 cursor-pointer hover:bg-orange-100 transition-colors"
                    onClick={openWalkInList}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-orange-800">Walk-ins</h3>
                        <div className="flex items-center gap-1">
                          <UserPlus className="w-6 h-6 text-orange-600" />
                          <ChevronRight className="w-4 h-4 text-orange-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-3xl font-bold text-orange-700">
                          {stats.walkIn.totalAttendees}
                        </div>
                        <div className="text-sm text-orange-600">
                          {stats.walkIn.registrations} walk-in registrations
                        </div>
                        <div className="text-xs text-orange-500">
                          {stats.walkIn.adults} adults, {stats.walkIn.kids} kids
                        </div>
                        <div className="text-xs text-orange-400 mt-1">Tap to view list</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Breakdown */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">
                          {stats.walkIn.adults}
                        </div>
                        <div className="text-sm text-blue-600">Walk-in Adults</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-700">
                          {stats.walkIn.kids}
                        </div>
                        <div className="text-sm text-purple-600">Walk-in Kids</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">
                          {stats.rsvpCheckIns.checkIns}
                        </div>
                        <div className="text-sm text-green-600">RSVP Families</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-700">
                          {stats.total.registrations}
                        </div>
                        <div className="text-sm text-gray-600">Total Check-ins</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Refresh Button */}
                <div className="text-center">
                  <Button
                    onClick={loadStats}
                    disabled={isLoading}
                    className="px-6"
                  >
                    {isLoading ? 'Refreshing...' : 'Refresh Now'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Walk-in List Modal */}
      {showWalkInList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-800">Walk-in Registrations</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWalkInList(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              {isLoadingWalkIns ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : walkInList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No walk-ins registered yet.</div>
              ) : (
                <div className="space-y-2">
                  {walkInList.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100"
                    >
                      <div>
                        <div className="font-medium text-gray-800">{record.last_name} family</div>
                        {record.kidGrades.length > 0 && (
                          <div className="text-sm text-gray-500">
                            Grades: {record.kidGrades.join(', ')}
                          </div>
                        )}
                        {record.email && (
                          <div className="text-xs text-gray-400">{record.email}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-orange-700">
                          {record.total_attendees} {record.total_attendees === 1 ? 'person' : 'people'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {record.adults}A / {record.kids}K
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(record.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-3 border-t text-center text-sm text-gray-500">
              {walkInList.length} {walkInList.length === 1 ? 'registration' : 'registrations'}
            </div>
          </div>
        </div>
      )}

      {/* Check-in List Modal */}
      {showCheckInList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-800">Checked-in Families</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCheckInList(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              {isLoadingCheckIns ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : checkInList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No families checked in yet.</div>
              ) : (
                <div className="space-y-2">
                  {checkInList.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100"
                    >
                      <div>
                        <div className="font-medium text-gray-800">{record.name}</div>
                        <div className="text-sm text-gray-500">{record.email}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-700">
                          {record.attendee_count} {record.attendee_count === 1 ? 'person' : 'people'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(record.checked_in_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-3 border-t text-center text-sm text-gray-500">
              {checkInList.length} {checkInList.length === 1 ? 'family' : 'families'} checked in
            </div>
          </div>
        </div>
      )}
    </GradientLayout>
  );
}