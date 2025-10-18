import type { ReactNode } from 'react';

interface GradientLayoutProps {
  children: ReactNode;
}

export default function GradientLayout({ children }: GradientLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-yellow-400">
      {children}
    </div>
  );
}