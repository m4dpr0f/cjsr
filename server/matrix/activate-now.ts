import { simpleMatrixClient } from './simple-matrix-client';

// Activate Matrix federation immediately
console.log('🚀 Activating CJSR Matrix Federation...');

simpleMatrixClient.configure(
  'https://matrix.org',
  'mat_nzrO3vHAfTIn6XPWIhMRzhOpZ1VuQ2_zS7U54',
  '@timeknot:matrix.org'
);

console.log('✅ Matrix Federation ACTIVE!');
console.log('🏁 Ready for real-time cross-server racing');

// Test race creation
async function createTestRace() {
  const testRace = {
    raceId: `cjsr-playtest-${Date.now()}`,
    prompt: 'In war, the way is to avoid what is strong and to strike at what is weak.',
    faction: 'd4',
    difficulty: 'medium' as const,
    maxPlayers: 4
  };
  
  console.log('🧪 Creating Matrix race room for playtesting...');
  const roomId = await simpleMatrixClient.createRaceRoom(testRace);
  
  if (roomId) {
    console.log('🎉 SUCCESS! Matrix race room created!');
    console.log(`🏟️ Room ID: ${roomId}`);
    console.log('🔗 Check your Element app - you should see the new race room!');
    return roomId;
  } else {
    console.log('⚠️ Matrix room creation needs debugging');
    return null;
  }
}

createTestRace().catch(console.error);

export { simpleMatrixClient };