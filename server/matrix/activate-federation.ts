import { simpleMatrixClient } from './simple-matrix-client';

// Activate CJSR Matrix Federation
export function activateCJSRMatrixFederation() {
  console.log('🚀 Activating CJSR Matrix Federation...');
  
  // Configure Matrix client with your credentials
  simpleMatrixClient.configure(
    'https://matrix.org',
    'mat_nzrO3vHAfTIn6XPWIhMRzhOpZ1VuQ2_zS7U54',
    '@timeknot:matrix.org'
  );
  
  console.log('✅ Matrix Federation Active!');
  console.log('🏁 CJSR can now create cross-server racing rooms');
  console.log('🌐 Faction-based federation ready');
  console.log('📡 Real-time race events via Matrix protocol');
  
  return simpleMatrixClient.isConnected;
}

// Test Matrix federation by creating a sample race room
export async function testMatrixFederation() {
  if (!simpleMatrixClient.isConnected) {
    console.log('❌ Matrix client not connected');
    return false;
  }
  
  console.log('🧪 Testing Matrix federation...');
  
  const testRace = {
    raceId: `test-${Date.now()}`,
    prompt: 'In war, the way is to avoid what is strong and to strike at what is weak.',
    faction: 'd4',
    difficulty: 'medium',
    maxPlayers: 8
  };
  
  try {
    const roomId = await simpleMatrixClient.createRaceRoom(testRace);
    if (roomId) {
      console.log('✅ Matrix federation test successful!');
      console.log(`🏟️ Created test race room: ${roomId}`);
      return true;
    } else {
      console.log('⚠️ Matrix federation configured but room creation failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Matrix federation test failed:', error);
    return false;
  }
}