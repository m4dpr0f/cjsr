import React from 'react';
import { SpriteDisplay } from '../components/ui/sprite-display';

export default function SpriteTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="py-8">
        <SpriteDisplay />
      </div>
    </div>
  );
}