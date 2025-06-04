import { simpleMatrixClient } from './simple-matrix-client';

// Direct activation function for immediate testing
export async function activateMatrixNow() {
  console.log('🚀 Activating CJSR Matrix Federation NOW...');
  
  // Configure Matrix client with your credentials
  simpleMatrixClient.configure(
    'https://matrix.org',
    'mat_nzrO3vHAfTIn6XPWIhMRzhOpZ1VuQ2_zS7U54',
    '@timeknot:matrix.org'
  );
  
  console.log('✅ Matrix Federation ACTIVE!');
  console.log(`📡 Status: ${simpleMatrixClient.getStatus()}`);
  
  // Test by creating a race room
  const testRace = {
    raceId: `cjsr-test-${Date.now()}`,
    prompt: 'In war, the way is to avoid what is strong and to strike at what is weak.',
    faction: 'd4',
    difficulty: 'medium' as const,
    maxPlayers: 8
  };
  
  console.log('🧪 Testing Matrix room creation...');
  const roomId = await simpleMatrixClient.createRaceRoom(testRace);
  
  if (roomId) {
    console.log('🎉 SUCCESS! Matrix federation is fully operational!');
    console.log(`🏟️ Created Matrix race room: ${roomId}`);
    console.log('🌐 CJSR can now host cross-server races!');
    return { success: true, roomId, status: 'Federation Active' };
  } else {
    console.log('⚠️ Matrix client configured but room creation needs debugging');
    return { success: false, status: 'Client configured, room creation failed' };
  }
}

// Call activation immediately when this module loads
activateMatrixNow().then(result => {
  if (result.success) {
    console.log('🎯 CJSR Matrix Federation is LIVE and ready for cross-server racing!');
  }
}).catch(error => {
  console.error('❌ Matrix activation error:', error);
});