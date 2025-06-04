import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { RaceTrack } from "@/components/ui/race-track";

export default function RaceTestPage() {
  // Sample players for testing
  const [players, setPlayers] = useState([
    {
      id: "player1",
      username: "Auto",
      progress: 0.1,
      chickenType: "auto", // Our HTML sprite!
      jockeyType: "combined",
      color: "#FFD700",
      isCurrentPlayer: true
    },
    {
      id: "player2",
      username: "Matikah",
      progress: 0.05,
      chickenType: "matikah", // Our HTML sprite!
      jockeyType: "combined",
      color: "#00BCD4",
      isCurrentPlayer: false
    },
    {
      id: "player3",
      username: "Death",
      progress: 0.02,
      chickenType: "death", // Our HTML sprite!
      jockeyType: "combined",
      color: "#F44336",
      isCurrentPlayer: false
    },
    {
      id: "player4",
      username: "Vanilla Racer",
      progress: 0.01,
      chickenType: "html_Golden", // Using HTML sprite as backup
      jockeyType: "combined",
      color: "#4CAF50",
      isCurrentPlayer: false
    }
  ]);
  
  // Animate race progress
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayers(prevPlayers => 
        prevPlayers.map(player => ({
          ...player,
          progress: Math.min(player.progress + (Math.random() * 0.02), 1)
        }))
      );
    }, 200);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-dark">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-2xl font-minecraft text-primary mb-6 text-center">HTML SPRITE RACE TEST</h1>
        
        <div className="max-w-4xl mx-auto mb-8">
          <p className="text-center text-light mb-6">
            Testing our new HTML sprites in the race track alongside traditional image sprites.
            Both sprite systems work seamlessly together!
          </p>
          
          <div className="mb-8">
            <RaceTrack 
              players={players}
              raceFinished={false}
              backgroundType="grass"
            />
          </div>
          
          <div className="bg-dark-800 p-4 rounded-lg mb-6">
            <h2 className="font-minecraft text-secondary mb-2">HTML vs Image Sprites</h2>
            <ul className="list-disc pl-6 space-y-2 text-light">
              <li>Auto, Matikah, and Death are using the new HTML sprites</li>
              <li>The Vanilla Racer is using the traditional image sprites</li>
              <li>Both types of sprites can be mixed in the same race</li>
              <li>HTML sprites scale better and have more customization options</li>
              <li>Image sprites are easier to create but less flexible</li>
            </ul>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={() => setPlayers(prevPlayers => 
                prevPlayers.map(player => ({
                  ...player,
                  progress: 0
                }))
              )}
              className="bg-primary text-dark font-bold py-2 px-4 rounded"
            >
              Reset Race
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}