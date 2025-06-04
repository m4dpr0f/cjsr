import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DonateBanner } from "@/components/donate-banner";
import Home from "@/pages/home";
import Race from "@/pages/race";
import Profile from "@/pages/profile-connected";
import CharacterRecord from "@/pages/character-record";
import Help from "@/pages/help";
import Practice from "@/pages/practice";
import Campaign from "@/pages/campaign";
import Fork from "@/pages/fork";
import Multiplayer from "@/pages/multiplayer";
import SinglePlayer from "@/pages/single-player";
import CampaignSelector from "@/pages/campaign-selector";
import Login from "@/pages/login";
import Register from "@/pages/register";
import RecoverAccount from "@/pages/recover-account";
import ResetPassword from "@/pages/reset-password";
import Contact from "@/pages/contact";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import Downloads from "@/pages/downloads";
import Settings from "@/pages/settings";
import CodexPage from "@/pages/codex";
import EggShrinePage from "@/pages/egg-shrine";
import SpriteTest from "@/pages/sprite-test";
import ShrinePage from "@/pages/shrine";
import HTMLSpritesPage from "@/pages/html-sprites";
import HTMLJockeyPage from "@/pages/html-jockey";
import RaceTestPage from "@/pages/race-test";
import Leaderboard from "@/pages/leaderboard";
import FactionWar from "@/pages/faction-war";
import FactionWars from "@/pages/faction-wars";
import PlacementRace from "@/pages/placement-race";
import GameMenu from "@/pages/game-menu";
import Scribe from "@/pages/scribe";
import GlyphScribes from "@/pages/glyph-scribes";
import FirstPersonRace from "@/pages/first-person-race";
import NewCampaignSelector from "@/pages/new-campaign-selector";
import MultiplayerLobby from "@/pages/multiplayer-lobby";
import MultiplayerRace from "@/pages/multiplayer/race-accurate";
import PrivateRaces from "@/pages/private-races";
import PrivateRaceRoom from "@/pages/private-race-room";
import MatrixRaceSocketIO from "@/pages/matrix-race-socketio";
import QuickRaceSocketIO from "@/pages/quick-race-socketio";
import TypingAdventure from "@/pages/typing-adventure";
import TypingChapter from "@/pages/typing-chapter";
import LearnToType from "@/pages/learn-to-type";
import Wisdom from "@/pages/wisdom";
import Intro from "@/pages/intro";
import MathsPage from "@/pages/maths";

import SteveCampaign from "@/pages/campaign/steve";
import AutoCampaign from "@/pages/campaign/auto";
import MatikahCampaign from "@/pages/campaign/matikah";
import IamCampaign from "@/pages/campaign/iam";
import CryptofaeArali from "@/pages/campaign/cryp70f43";
import TessarionChallenge from "@/pages/campaign/73554r10n";
import TrustNoOne from "@/pages/tno";
import AdminPanel from "@/pages/admin-panel";
import SimpleAdmin from "@/pages/simple-admin";
import ChocoboLevel from "@/pages/chocobo-level";
import { DonorRace } from "@/pages/donor-race";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/race" component={Race} />
      <Route path="/practice" component={Practice} />
      {/* We're migrating from the old campaign system to the new character-based one */}
      <Route path="/campaign" component={NewCampaignSelector} />
      <Route path="/fork" component={Fork} />
      <Route path="/multiplayer" component={Race} />
      <Route path="/multiplayer/npc/:difficulty" component={MultiplayerRace} />
      <Route path="/multiplayer/race" component={MultiplayerRace} />
      <Route path="/single-player" component={SinglePlayer} />
      <Route path="/profile" component={Profile} />

      <Route path="/help" component={Help} />
      <Route path="/contact" component={Contact} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/recover-account" component={RecoverAccount} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/downloads" component={Downloads} />
      <Route path="/settings" component={Settings} />
      <Route path="/egg-shrine" component={EggShrinePage} />
      <Route path="/codex" component={() => {
        // Redirect from old /codex path to the new /egg-shrine path
        window.location.href = '/egg-shrine';
        return null;
      }} />
      <Route path="/sprite-test" component={SpriteTest} />
      <Route path="/shrine" component={ShrinePage} />
      <Route path="/html-sprites" component={HTMLSpritesPage} />
      <Route path="/html-jockey" component={HTMLJockeyPage} />
      <Route path="/race-test" component={RaceTestPage} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/faction-war" component={FactionWar} />
      <Route path="/faction-wars" component={FactionWars} />
      <Route path="/placement-race" component={PlacementRace} />
      <Route path="/game-menu" component={GameMenu} />
      <Route path="/scribe" component={Scribe} />
      <Route path="/glyph-scribes" component={GlyphScribes} />
      <Route path="/first-person-race" component={FirstPersonRace} />
      {/* Private Races System */}
      <Route path="/private-races" component={PrivateRaces} />
      <Route path="/private-race/:roomId" component={PrivateRaceRoom} />
      {/* Matrix Federation Racing */}
      <Route path="/matrix-race" component={MatrixRaceSocketIO} />
      <Route path="/matrix-race-socketio" component={MatrixRaceSocketIO} />
      {/* Quick Race redirects to multiplayer race */}
      {/* This is the main entry point for our new character-based campaign system */}
      <Route path="/multiplayer-lobby" component={MultiplayerLobby} />
      <Route path="/campaign/steve" component={SteveCampaign} />
      <Route path="/campaign/auto" component={AutoCampaign} />
      <Route path="/campaign/matikah" component={MatikahCampaign} />
      <Route path="/campaign/iam" component={IamCampaign} />
      {/* Hidden Cryptofae Campaign */}
      <Route path="/cryp70f43/4r4l1" component={CryptofaeArali} />
      <Route path="/cryp70f43/73554r10n" component={TessarionChallenge} />
      {/* React Jam Trust No One Landing Page */}
      <Route path="/tno" component={TrustNoOne} />
      {/* Special Donor Appreciation Race */}
      <Route path="/donor-race" component={DonorRace} />
      {/* Secret Chocobo SOLDIER Campaign - Hidden Easter Egg */}
      <Route path="/there-is-no/chocobo_level" component={ChocoboLevel} />
      {/* Introduction Portal */}
      <Route path="/intro" component={Intro} />
      {/* Learn to Type Adventure */}
      <Route path="/learn-to-type" component={LearnToType} />
      {/* Math Races */}
      <Route path="/maths" component={MathsPage} />
      {/* Typing Adventure */}
      <Route path="/typing-adventure/:chapterId">{(params) => <TypingChapter chapterId={params.chapterId} />}</Route>
      <Route path="/typing-adventure" component={TypingAdventure} />
      <Route path="/wisdom" component={Wisdom} />
      
      {/* Admin Panel */}
      <Route path="/admin" component={SimpleAdmin} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showDonate, setShowDonate] = useState(false);
  
  // Show donate banner immediately
  useEffect(() => {
    setShowDonate(true);
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        {showDonate && <DonateBanner />}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
