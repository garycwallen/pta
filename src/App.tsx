/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { apiClient } from './services/apiClient';
import MainKioskScreen from './components/MainKioskScreen';
import WalkInRegistrationForm from './components/WalkInRegistrationForm';
import RsvpFamilySelector from './components/RsvpFamilySelector';
import ConfirmationScreen from './components/ConfirmationScreen';
import AdminStatsPage from './components/AdminStatsPage';

type Screen = 'main' | 'walkIn' | 'rsvp' | 'confirmation' | 'admin';

interface WalkInData {
  adults: number;
  kids: number;
  kidGrades: string[];
  email?: string;
}

interface ConfirmationData {
  type: 'rsvp' | 'walkIn';
  name?: string;
  attendeeCount?: number;
  gradeLevels?: string;
  adults?: number;
  kids?: number;
  kidGrades?: string[];
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [confirmationData, setConfirmationData] =
    useState<ConfirmationData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelection = (choice: 'yes' | 'no') => {
    if (choice === 'yes') {
      setCurrentScreen('rsvp');
    } else {
      setCurrentScreen('walkIn');
    }
  };

  const handleWalkInSubmit = async (data: WalkInData) => {
    setIsSubmitting(true);
    try {
      console.log('📝 Submitting walk-in registration:', data);
      await apiClient.createWalkInRegistration(data);
      console.log('✅ Walk-in registration successful!');

      setConfirmationData({
        type: 'walkIn',
        adults: data.adults,
        kids: data.kids,
        kidGrades: data.kidGrades,
      });
      setCurrentScreen('confirmation');
    } catch (error) {
      console.error('❌ Walk-in registration failed:', error);
      setConfirmationData({
        type: 'walkIn',
        adults: data.adults,
        kids: data.kids,
        kidGrades: data.kidGrades,
      });
      setCurrentScreen('confirmation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRsvpCheckIn = (familyData: any) => {
    console.log('✅ RSVP check-in completed for:', familyData);
    setConfirmationData({
      type: 'rsvp',
      name: familyData.name,
      attendeeCount: familyData.attendeeCount,
      gradeLevels: familyData.gradeLevels,
    });
    setCurrentScreen('confirmation');
  };

  const handleBackToMain = () => {
    setCurrentScreen('main');
    setConfirmationData(null);
    setIsSubmitting(false);
  };

  switch (currentScreen) {
    case 'main':
      return (
        <MainKioskScreen
          onSelection={handleSelection}
          onAdminClick={() => setCurrentScreen('admin')}
          isSubmitting={isSubmitting}
        />
      );

    case 'walkIn':
      return (
        <WalkInRegistrationForm
          onSubmit={handleWalkInSubmit}
          onBack={handleBackToMain}
        />
      );

    case 'rsvp':
      return (
        <RsvpFamilySelector
          onCheckInComplete={handleRsvpCheckIn}
          onBack={handleBackToMain}
        />
      );

    case 'confirmation':
      return confirmationData ? (
        <ConfirmationScreen
          data={confirmationData}
          onTimeout={handleBackToMain}
        />
      ) : (
        <MainKioskScreen
          onSelection={handleSelection}
          onAdminClick={() => setCurrentScreen('admin')}
          isSubmitting={isSubmitting}
        />
      );

    case 'admin':
      return <AdminStatsPage onClose={handleBackToMain} />;

    default:
      return (
        <MainKioskScreen
          onSelection={handleSelection}
          onAdminClick={() => setCurrentScreen('admin')}
          isSubmitting={isSubmitting}
        />
      );
  }
}
