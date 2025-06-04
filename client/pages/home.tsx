import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PixelButton } from "@/components/ui/pixel-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Trophy,
  Users,
  Zap,
  Crown,
  Star,
  Shield,
  Sword,
  Feather,
  ScrollText,
  Target,
  Gamepad2,
  BookOpen,
  Timer,
  Award,
  Lock,
  Unlock,
  Calculator,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMatrixSocketIO } from "@/hooks/useMatrixSocketIO";
import appDevFundBanner from "../assets/app-dev-fund-banner.png";
import matrixLogo from "@assets/CJSR Matrix Logo256.png";
import matrixFederationBg from "@assets/image_1748543806188.png";

// Matrix Race Widget Component
function EmojiGateway() {
  const [, setLocation] = useLocation();
  const [emojiInput, setEmojiInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // The gateway emoji - any of the 9 Adinkra emojis from Chapter 1
  const validEmojis = ["🧿", "💜", "⚖️", "🤲", "🌿", "💫", "🪞", "🌬️", "🔁"];

  const handleEmojiChange = (value: string) => {
    setEmojiInput(value);

    if (validEmojis.includes(value)) {
      setIsUnlocked(true);
      setTimeout(() => {
        setLocation("/glyph-scribes");
      }, 1000);
    } else if (value.length > 0) {
      setShowHint(true);
      setTimeout(() => setShowHint(false), 3000);
    }
  };

  if (isUnlocked) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="text-4xl animate-pulse">✨</div>
        <div className="text-amber-300 font-minecraft text-sm">
          Gateway Unlocked!
        </div>
        <div className="text-amber-400 text-xs">Entering Glyph Scribes...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="flex items-center gap-3">
        <Lock className="w-5 h-5 text-amber-500" />
        <div className="text-center">
          <div className="text-sm font-minecraft text-amber-300 mb-1">
            EMOJI GATEWAY
          </div>
          <div className="text-xs text-amber-400/80">
            Enter any Adinkra symbol to access
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={emojiInput}
          onChange={(e) => handleEmojiChange(e.target.value)}
          placeholder="🧿"
          className="w-16 h-12 text-center text-2xl bg-black/60 border-amber-500/40 text-amber-200 focus:border-amber-400"
          maxLength={2}
        />
        <PixelButton
          onClick={() => emojiInput && handleEmojiChange(emojiInput)}
          className="bg-amber-700 hover:bg-amber-600 text-amber-200 px-3 py-2"
          disabled={!emojiInput}
        >
          ENTER
        </PixelButton>
      </div>

      {showHint && (
        <div className="text-xs text-amber-500 animate-pulse text-center max-w-xs">
          Try one of the sacred Adinkra symbols shown above... 🧿 💜 ⚖️ 🤲 🌿 💫
          🪞 🌬️ 🔁
        </div>
      )}
    </div>
  );
}

function MatrixRaceWidget({ user }: { user: any }) {
  const [, setLocation] = useLocation();

  const matrixSocket = useMatrixSocketIO({
    userId: user?.id || 0,
    username: user?.username || "Guest",
  });

  const { players, isReady, racePrompt } = matrixSocket;

  const handleJoinMatrixRace = () => {
    if (!user) {
      // For new users, show invitation and redirect to practice
      if (
        confirm(
          "Welcome to the mystic journey of a Scribe Racer! First, let's create your profile and learn the basics in our practice arena. Ready to begin your adventure?",
        )
      ) {
        setLocation("/practice");
      }
    } else {
      // For existing users, go directly to Matrix race
      setLocation("/matrix-race");
    }
  };

  const activePlayerCount = Object.keys(players).length;
  const isRaceActive =
    matrixSocket.raceResults && matrixSocket.raceResults.length > 0;

  return (
    <Card className="mb-6 relative overflow-hidden bg-gradient-to-r from-gray-900/90 to-black/90 border-green-500/40 shadow-2xl shadow-green-500/20">
      {/* Background Image */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url(${matrixFederationBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.4)",
        }}
      />

      {/* Circuit pattern overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-900/10 via-transparent to-green-900/10"></div>

      {/* Content */}
      <div className="relative z-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-green-400 font-mono tracking-wider text-xl">
            <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            <span className="bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent font-bold">
              MATRIX FEDERATION RACE
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="text-sm text-green-300/80 mb-2 font-mono">
                🌐 Cross-server multiplayer racing • {activePlayerCount} scribes
                connected
              </div>
              {isRaceActive ? (
                <div className="text-green-400 font-semibold mb-2 font-mono tracking-wide">
                  🏁 Race completed! Results available
                </div>
              ) : (
                <div className="text-cyan-400 font-semibold mb-2 font-mono tracking-wide">
                  ⏳ Waiting for more scribes to join the federation
                </div>
              )}
              {racePrompt && (
                <div className="text-xs text-green-400/70 bg-black/40 border border-green-500/30 p-3 rounded-lg mt-2 max-w-md font-mono">
                  <span className="text-green-300">Current text:</span> "
                  {racePrompt.substring(0, 50)}..."
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <img
                  src={matrixLogo}
                  alt="Matrix Federation Racing Logo"
                  className="w-20 h-20 object-contain opacity-90 hover:opacity-100 transition-all duration-300 filter drop-shadow-lg"
                />
              </div>
              <PixelButton
                onClick={handleJoinMatrixRace}
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-black font-bold px-8 py-4 border border-green-400 shadow-lg shadow-green-500/40 font-mono tracking-wider transition-all duration-300 hover:scale-105"
              >
                {user ? "JOIN MATRIX RACE" : "BEGIN YOUR JOURNEY"}
              </PixelButton>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

// Component to display character cards in the gallery
interface CharacterCardProps {
  name: string;
  spriteId: string;
  description: string;
  locked?: boolean;
  level?: number;
}

function CharacterCard({
  name,
  spriteId,
  description,
  locked,
  level,
}: CharacterCardProps) {
  return (
    <Card className={`relative overflow-hidden ${locked ? "opacity-70" : ""}`}>
      <CardContent className="p-4 flex flex-col items-center">
        <div className="w-full py-4 flex justify-center">
          <ChickenAvatar
            chickenType={spriteId}
            jockeyType={spriteId}
            size="lg"
            showName={false}
          />
        </div>

        <h3 className="font-pixel text-primary text-center mt-2">{name}</h3>
        <p className="text-xs text-light text-center mt-1 line-clamp-3">
          {description}
        </p>

        {locked && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="w-6 h-6 text-yellow-500 mb-2">🔒</div>
            <Badge
              variant="outline"
              className="border-yellow-500 text-yellow-400"
            >
              Unlocks at Level {level}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Function to create a placement race (first-time user experience)
const createPlacementRace = () => {
  // Classic pangram for placement test
  const placementPrompt = "The quick brown fox jumps over the lazy dog.";
  // Save this to session storage to be picked up by the placement race component
  sessionStorage.setItem("placement_prompt", placementPrompt);
  sessionStorage.setItem("is_placement", "true");
};

export default function Home() {
  const [, setLocation] = useLocation();

  // Fetch profile data to check if user is logged in
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/profile"],
    retry: false,
  });

  const isLoggedIn = !!profile;

  useEffect(() => {
    // Set the document title
    document.title = "Chicken Jockey Scribe Racer - A Typing Race Game";
  }, []);

  // Handle Play Now button - go to practice arena for new users
  const handlePlayNow = () => {
    if (isLoggedIn) {
      // For logged in users, go to the game menu
      setLocation("/game-menu");
    } else {
      // For new users, go to practice arena with placement test
      setLocation("/practice");
    }
  };

  // Handle Login button
  const handleLogin = () => {
    setLocation("/login");
  };

  // Handle direct navigation to game modes for logged in users
  const handleRace = () => {
    setLocation("/race");
  };

  const handlePractice = () => {
    setLocation("/practice");
  };

  const handleCampaign = () => {
    if (isLoggedIn) {
      setLocation("/campaign");
    } else {
      // For non-logged-in users, redirect to practice with a message about campaigns
      if (
        confirm(
          "Campaigns require an account to track your progress and unlock rewards. Would you like to start with practice mode to create your profile first?",
        )
      ) {
        setLocation("/practice");
      }
    }
  };

  const handleProfile = () => {
    setLocation("/profile");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* New Player Portal Button */}
        <div className="mb-6 text-center">
          <PixelButton
            onClick={() => setLocation("/intro")}
            className="bg-purple-600 hover:bg-purple-700 text-white font-minecraft text-lg px-8 py-4 mx-auto"
          >
            <Star className="w-6 h-6 mr-2" />
            NEW PLAYER? START HERE
          </PixelButton>
          <p className="text-gray-400 text-sm mt-2">
            Complete intro guide with interactive demo, placement test & typing
            adventure
          </p>
        </div>

        {/* React Jam Badge */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={() => setLocation("/tno")}
            className="bg-gradient-to-r from-red-900 via-orange-900 to-red-900 border-2 border-red-500 rounded-lg p-4 shadow-lg max-w-md transition-transform hover:scale-105 cursor-pointer"
          >
            <div className="flex items-center justify-center space-x-3">
              <div className="text-2xl">🏆</div>
              <div className="text-center">
                <div className="text-sm font-pixel text-red-200">
                  REACT JAM SPRING 2025
                </div>
                <div className="text-lg font-bold text-white">TRUST NO ONE</div>
                <div className="text-xs text-red-300">
                  Every keystroke could be a lie...
                </div>
              </div>
              <div className="text-2xl">⚠️</div>
            </div>
          </button>
        </div>

        {/* Matrix Race Widget */}
        <MatrixRaceWidget user={profile} />

        {/* Discord Promotion Section */}
        <Card className="mb-8 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border-indigo-500/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-indigo-200">
              <div className="text-2xl">🤖</div>
              <div>
                <div className="text-xl font-minecraft">CJSR DISCORD BOT</div>
                <div className="text-sm font-normal text-indigo-300">
                  Bring races to your Discord server!
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-indigo-200 mb-3">
                  Bot Features:
                </h3>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    Race results & leaderboards automatically posted
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    Player stats & achievements shared to your community
                  </li>
                  <li className="flex items-center gap-2">
                    <ScrollText className="w-4 h-4 text-green-400" />
                    Sacred text completions from the typing adventure
                  </li>
                  <li className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-purple-400" />
                    Faction victories & campaign progress updates
                  </li>
                </ul>
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-center mb-4">
                  <div className="text-lg font-semibold text-indigo-200 mb-2">
                    Add to Your Server
                  </div>
                  <div className="text-sm text-gray-400 mb-4">
                    Automatically share player achievements and build community
                    around typing races
                  </div>
                </div>
                <PixelButton
                  onClick={() =>
                    window.open(
                      "https://discord.com/oauth2/authorize?client_id=1377550334389391390&permissions=2048&scope=bot%20applications.commands",
                      "_blank",
                    )
                  }
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 mx-auto"
                >
                  <div className="flex items-center gap-2">
                    <div className="text-lg">📲</div>
                    <span>INVITE BOT TO SERVER</span>
                  </div>
                </PixelButton>
                <div className="text-xs text-gray-500 text-center mt-2">
                  Perfect for gaming communities & typing enthusiasts
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-minecraft text-primary mb-4 drop-shadow-lg">
            CHICKEN JOCKEY
          </h1>
          <h2 className="text-4xl md:text-6xl font-minecraft text-secondary mb-6">
            SCRIBE RACER
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            The ultimate typing racing game where mystical Garu companions carry
            heroic jockeys through epic adventures. Race with strategic passages
            from Sun Tzu's Art of War, compete across 8 elemental factions, and
            unlock legendary characters!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <PixelButton
              onClick={handlePlayNow}
              className="bg-primary hover:bg-primary/90 text-dark font-minecraft text-xl px-8 py-4"
            >
              <Gamepad2 className="w-6 h-6 mr-2" />
              {isLoggedIn ? "CONTINUE ADVENTURE" : "START YOUR JOURNEY"}
            </PixelButton>

            {!isLoggedIn && (
              <PixelButton
                onClick={handleLogin}
                className="bg-secondary hover:bg-secondary/90 text-dark font-minecraft text-lg px-6 py-3"
              >
                LOGIN / REGISTER
              </PixelButton>
            )}
          </div>
        </div>

        {/* Game Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Typing Race Combat */}
          <Card className="bg-dark/80 border-primary/50 hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="text-primary font-minecraft flex items-center">
                <Sword className="w-5 h-5 mr-2" />
                TYPING RACE COMBAT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4">
                Race through strategic passages from Sun Tzu's Art of War. Every
                keystroke matters in this tactical typing challenge!
              </p>
              <div className="space-y-2">
                <PixelButton
                  onClick={() => setLocation("/multiplayer/race")}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  QUICK RACE
                </PixelButton>
                <PixelButton
                  onClick={() => setLocation("/race")}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <Target className="w-4 h-4 mr-2" />
                  MULTIPLAYER RACE
                </PixelButton>
              </div>
            </CardContent>
          </Card>

          {/* 8 Elemental Factions */}
          <Card className="bg-dark/80 border-primary/50 hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="text-primary font-minecraft flex items-center">
                <Shield className="w-5 h-5 mr-2" />8 ELEMENTAL FACTIONS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4">
                Choose your faction: D2/Electric, D4/Fire, D6/Earth, D8/Air,
                D10/Chaos, D12/Ether, D20/Water, D100/Order
              </p>
              <PixelButton
                onClick={() => setLocation("/faction-wars")}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                FACTION WARS
              </PixelButton>
            </CardContent>
          </Card>

          {/* Math Races */}
          <Card className="bg-dark/80 border-emerald-500/50 hover:border-emerald-500 transition-colors">
            <CardHeader>
              <CardTitle className="text-emerald-400 font-minecraft flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                MATH RACES
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4">
                Type numbers at racing speed! K-4th grade math levels from
                counting to multiplication. Earn GaruCoins for D2 Egg unlocks.
              </p>
              <PixelButton
                onClick={() => setLocation("/maths")}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                <Calculator className="w-4 h-4 mr-2" />
                START MATH RACE
              </PixelButton>
            </CardContent>
          </Card>

          {/* Learn to Type Adventure */}
          <Card className="bg-dark/80 border-purple-500/50 hover:border-purple-500 transition-colors">
            <CardHeader>
              <CardTitle className="text-purple-400 font-minecraft flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                LEARN TO TYPE QUEST
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4">
                Master the Sacred Keys through 12 mystical realms. From home row
                basics to ancient scripts and sacred wisdom.
              </p>
              <PixelButton
                onClick={() => setLocation("/typing-adventure")}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <ScrollText className="w-4 h-4 mr-2" />
                BEGIN ADVENTURE
              </PixelButton>
            </CardContent>
          </Card>

          {/* Campaign Adventures */}
          <Card className="bg-dark/80 border-primary/50 hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="text-primary font-minecraft flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                EPIC CAMPAIGNS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4">
                Experience 4 unique storylines: Steve's heroic journey, Auto's
                tech mastery, Matikah's mysticism, and Iam's mysterious poetry.
              </p>
              <PixelButton
                onClick={handleCampaign}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <ScrollText className="w-4 h-4 mr-2" />
                START CAMPAIGN
              </PixelButton>
            </CardContent>
          </Card>

          {/* Elite Unlocks */}
          <Card className="bg-dark/80 border-yellow-500/50 hover:border-yellow-500 transition-colors">
            <CardHeader>
              <CardTitle className="text-yellow-400 font-minecraft flex items-center">
                <Crown className="w-5 h-5 mr-2" />
                ELITE UNLOCKS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4">
                Death Mount (10k XP), Golden Champion (20k XP), Peacock Champion
                & Mount (100k XP)
              </p>
              <PixelButton
                onClick={() => setLocation("/profile")}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                <Feather className="w-4 h-4 mr-2" />
                VIEW PROGRESS
              </PixelButton>
            </CardContent>
          </Card>

          {/* Multiplayer Racing */}
          <Card className="bg-dark/80 border-primary/50 hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="text-primary font-minecraft flex items-center">
                <Users className="w-5 h-5 mr-2" />
                MULTIPLAYER RACING
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4">
                Race against players across the Matrix federation in real-time
                multiplayer races with cross-server connectivity.
              </p>
              <PixelButton
                onClick={() => {
                  // Always go to Matrix Federation race - it will handle fallbacks internally
                  setLocation("/matrix-race");
                }}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Users className="w-4 h-4 mr-2" />
                JOIN MULTIPLAYER RACE
              </PixelButton>
            </CardContent>
          </Card>

          {/* Practice Arena */}
          <Card className="bg-dark/80 border-primary/50 hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="text-primary font-minecraft flex items-center">
                <Timer className="w-5 h-5 mr-2" />
                PRACTICE ARENA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4">
                Hone your skills with curated text prompts. Perfect for
                beginners and warming up before competitive races.
              </p>
              <PixelButton
                onClick={handlePractice}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                <Target className="w-4 h-4 mr-2" />
                PRACTICE NOW
              </PixelButton>
            </CardContent>
          </Card>
        </div>

        {/* Character System Showcase */}
        <Card className="bg-dark/80 border-primary/50 mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-primary font-minecraft text-center flex items-center justify-center">
              <Star className="w-6 h-6 mr-2" />
              CHARACTER COLLECTION SYSTEM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-minecraft text-primary mb-2">
                  GARU MOUNTS
                </h3>
                <p className="text-sm text-gray-300">
                  20+ unique companions including Steve's legendary mount,
                  Death, and the iridescent Peacock Mount
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Award className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="font-minecraft text-secondary mb-2">
                  HEROIC JOCKEYS
                </h3>
                <p className="text-sm text-gray-300">
                  Campaign heroes, Golden Champion, and the exclusive Peacock
                  Champion with dark blue skin
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Feather className="w-8 h-8 text-yellow-500" />
                </div>
                <h3 className="font-minecraft text-yellow-400 mb-2">
                  MYSTICAL TRAILS
                </h3>
                <p className="text-sm text-gray-300">
                  Unlock magical particle effects and elemental trails through
                  campaign completion
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Crown className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="font-minecraft text-purple-400 mb-2">
                  FACTION PROGRESS
                </h3>
                <p className="text-sm text-gray-300">
                  Earn XP in your chosen element to unlock prestigious titles
                  and elite characters
                </p>
              </div>
            </div>

            <div className="text-center">
              <PixelButton
                onClick={() => setLocation("/profile")}
                className="bg-primary hover:bg-primary/90 text-dark font-minecraft"
              >
                CUSTOMIZE YOUR HERO
              </PixelButton>
            </div>
          </CardContent>
        </Card>

        {/* GLYPH SCRIBES - Adinkra Learning System */}
        <Card className="mb-8 bg-gradient-to-r from-amber-900/40 via-yellow-900/40 to-orange-900/40 border-amber-500/60 shadow-2xl shadow-amber-500/20">
          <CardHeader>
            <CardTitle className="text-2xl text-amber-200 font-minecraft text-center flex items-center justify-center gap-3">
              <div className="text-3xl">📜</div>
              <div>
                <div>GLYPH SCRIBES</div>
                <div className="text-sm font-normal text-amber-300">
                  Master the Sacred Symbols of West Africa
                </div>
              </div>
              <div className="text-3xl">✨</div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <h3 className="text-xl font-minecraft text-amber-200 mb-3">
                📘 Tome 1: Glyphs of the Ancestors
              </h3>
              <p className="text-amber-100 mb-4 max-w-3xl mx-auto">
                Begin your journey into the profound wisdom of{" "}
                <strong>Adinkra</strong> symbols from Ghana's Akan tradition.
                Each glyph carries centuries of philosophical meaning about
                character, wisdom, and life's essential truths.
              </p>

              <div className="bg-black/30 border border-amber-500/40 rounded-lg p-4 mb-6 max-w-4xl mx-auto">
                <h4 className="text-lg font-minecraft text-amber-300 mb-2">
                  Chapter 1: Symbols of Character
                </h4>
                <div className="text-xs text-amber-400/80 mb-4 text-center">
                  <strong>Note:</strong> Emojis shown are visual approximations.
                  View authentic symbol designs at{" "}
                  <a
                    href="https://adinkra.org"
                    target="_blank"
                    className="underline hover:text-amber-300"
                  >
                    Adinkra.org
                  </a>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4 mb-4">
                  <div className="flex flex-col items-center p-2 bg-amber-900/20 rounded border border-amber-600/40">
                    <div className="text-2xl mb-1">🧿</div>
                    <div className="text-xs text-amber-200 text-center font-bold">
                      DWENNIMMEN
                    </div>
                    <div className="text-xs text-amber-300 text-center">
                      Humility & Strength
                    </div>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-amber-900/20 rounded border border-amber-600/40">
                    <div className="text-2xl mb-1">💜</div>
                    <div className="text-xs text-amber-200 text-center font-bold">
                      AKOMA
                    </div>
                    <div className="text-xs text-amber-300 text-center">
                      Heart & Patience
                    </div>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-amber-900/20 rounded border border-amber-600/40">
                    <div className="text-2xl mb-1">⚖️</div>
                    <div className="text-xs text-amber-200 text-center font-bold">
                      NYANSAPO
                    </div>
                    <div className="text-xs text-amber-300 text-center">
                      Wisdom Knot
                    </div>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-amber-900/20 rounded border border-amber-600/40">
                    <div className="text-2xl mb-1">🤲</div>
                    <div className="text-xs text-amber-200 text-center font-bold">
                      FAWOHODIE
                    </div>
                    <div className="text-xs text-amber-300 text-center">
                      Freedom
                    </div>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-amber-900/20 rounded border border-amber-600/40">
                    <div className="text-2xl mb-1">🌿</div>
                    <div className="text-xs text-amber-200 text-center font-bold">
                      AYA
                    </div>
                    <div className="text-xs text-amber-300 text-center">
                      Endurance
                    </div>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-amber-900/20 rounded border border-amber-600/40">
                    <div className="text-2xl mb-1">💫</div>
                    <div className="text-xs text-amber-200 text-center font-bold">
                      ESE NE TEKREMA
                    </div>
                    <div className="text-xs text-amber-300 text-center">
                      Friendship
                    </div>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-amber-900/20 rounded border border-amber-600/40">
                    <div className="text-2xl mb-1">🪞</div>
                    <div className="text-xs text-amber-200 text-center font-bold">
                      MATE MASIE
                    </div>
                    <div className="text-xs text-amber-300 text-center">
                      Discernment
                    </div>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-amber-900/20 rounded border border-amber-600/40">
                    <div className="text-2xl mb-1">🌬️</div>
                    <div className="text-xs text-amber-200 text-center font-bold">
                      NKYINKYIM
                    </div>
                    <div className="text-xs text-amber-300 text-center">
                      Initiative
                    </div>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-amber-900/20 rounded border border-amber-600/40">
                    <div className="text-2xl mb-1">🔁</div>
                    <div className="text-xs text-amber-200 text-center font-bold">
                      SESA WO SUBAN
                    </div>
                    <div className="text-xs text-amber-300 text-center">
                      Transformation
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-amber-200 mb-3">
                    <strong>Challenge:</strong> Type each glyph's name, meaning,
                    and cultural lore with 100% accuracy to unlock it in your
                    Personal Glyph Toolkit
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <EmojiGateway />

                    <div className="flex gap-2">
                      <PixelButton
                        onClick={() =>
                          window.open("http://adinkra.org", "_blank")
                        }
                        className="bg-amber-800 hover:bg-amber-700 text-amber-200 px-4 py-2 text-sm"
                      >
                        📚 Learn More at Adinkra.org
                      </PixelButton>
                      <PixelButton
                        onClick={() =>
                          window.open(
                            "https://libraryofmeme.wordpress.com/wp-content/uploads/2025/06/adinkra.org-index.pdf",
                            "_blank",
                          )
                        }
                        className="bg-amber-800 hover:bg-amber-700 text-amber-200 px-4 py-2 text-sm"
                      >
                        📄 Symbol Index PDF
                      </PixelButton>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-amber-400/80 max-w-2xl mx-auto space-y-2">
                <div>
                  <strong>Cultural Note:</strong> Adinkra symbols originated
                  with the Akan people of Ghana and represent profound
                  philosophical concepts. This educational implementation honors
                  their wisdom traditions while teaching digital literacy
                  through cultural appreciation.
                </div>
                <div className="text-amber-500/70 text-center">
                  <strong>⚠️ Early Development:</strong> This feature is in
                  active development and will see major improvements including
                  authentic symbol graphics, expanded cultural content, and
                  enhanced learning mechanics in upcoming releases.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust No One - React Jam Feature */}
        <Card className="bg-gradient-to-r from-red-900/50 via-orange-900/50 to-red-900/50 border-red-500 mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-red-300 font-minecraft text-center flex items-center justify-center">
              ⚠️ TRUST NO ONE - REACT JAM 2025 ⚠️
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-red-200 mb-4 max-w-2xl mx-auto">
                Experience the acclaimed React Jam submission that explores
                themes of deception and resistance. Every keystroke could be a
                lie... Can you trust your own typing?
              </p>
              <PixelButton
                onClick={() => setLocation("/tno")}
                className="bg-red-600 hover:bg-red-700 text-white font-minecraft"
              >
                <Shield className="w-4 h-4 mr-2" />
                ENTER THE TRILOGY
              </PixelButton>
            </div>
          </CardContent>
        </Card>

        {/* Community Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-dark/80 border-primary/50">
            <CardHeader>
              <CardTitle className="text-primary font-minecraft flex items-center">
                <ScrollText className="w-5 h-5 mr-2" />
                SCRIBE SYSTEM
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4">
                Contribute your own writing to the game's prompt collection.
                Share stories, poetry, and creative content that other players
                will type through in races.
              </p>
              <PixelButton
                onClick={() => setLocation("/scribe")}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                BECOME A SCRIBE
              </PixelButton>
            </CardContent>
          </Card>

          <Card className="bg-dark/80 border-primary/50">
            <CardHeader>
              <CardTitle className="text-primary font-minecraft flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                GLOBAL LEADERBOARDS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4">
                Compete for supremacy across all 8 elemental factions. Track
                your WPM, accuracy, and faction XP against players worldwide.
              </p>
              <PixelButton
                onClick={() => setLocation("/faction-wars")}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                VIEW RANKINGS
              </PixelButton>
            </CardContent>
          </Card>
        </div>
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg p-8 mb-10 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-pixel text-primary mb-4">
                Choose Your Faction. Master Your Element.
              </h1>
              <h2 className="text-2xl md:text-3xl font-pixel text-white mb-6">
                The Ultimate Elemental Typing Wars Experience.
              </h2>
              <p className="text-lg text-light mb-6">
                Join epic 8-player elemental faction battles! Choose from Fire,
                Water, Earth, Air, Chaos, Ether, Coin, or Order factions. Unlock
                legendary Garu mounts, compete in character-driven story
                campaigns, and claim elemental eggs. This isn't just typing -
                it's an RPG adventure where every keystroke matters!
              </p>

              {!isLoggedIn ? (
                // Not logged in view - Show Play Now and Login buttons
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <PixelButton
                      variant="default"
                      size="lg"
                      onClick={handlePlayNow}
                      className="w-full bg-red-600 hover:bg-red-700 border-0"
                    >
                      <span className="flex items-center justify-center">
                        <span className="mr-2">»</span> Play Now
                      </span>
                    </PixelButton>
                    <p className="text-xs text-center mt-1 text-gray-300">
                      New Users
                    </p>
                  </div>

                  <div>
                    <PixelButton
                      variant="outline"
                      size="lg"
                      onClick={handleLogin}
                      className="w-full"
                    >
                      Log In
                    </PixelButton>
                    <p className="text-xs text-center mt-1 text-gray-300">
                      Have an Account?
                    </p>
                  </div>
                </div>
              ) : (
                // Logged in view - Show quick access buttons
                <div>
                  {profile && (
                    <div className="flex items-center mb-4 bg-blue-950/70 p-3 rounded-lg">
                      <div className="mr-3">
                        <ChickenAvatar
                          chickenType={(profile as any).chicken_type || "white"}
                          jockeyType={(profile as any).jockey_type || "steve"}
                          size="sm"
                        />
                      </div>
                      <div>
                        <p className="text-primary font-pixel">
                          Welcome back, {(profile as any).username}!
                        </p>
                        <p className="text-xs text-gray-300">
                          Level {(profile as any).level || 1} • WPM:{" "}
                          {Math.round((profile as any).avg_wpm) || 0} •
                          Accuracy: {(profile as any).accuracy || 0}%
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <PixelButton
                      onClick={() => setLocation("/multiplayer/race")}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 border-0"
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Quick Race
                    </PixelButton>

                    <PixelButton onClick={handlePractice} className="w-full">
                      Practice
                    </PixelButton>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <PixelButton
                      onClick={handleCampaign}
                      variant="outline"
                      className="w-full"
                    >
                      Campaign
                    </PixelButton>

                    <PixelButton
                      onClick={handleProfile}
                      variant="outline"
                      className="w-full"
                    >
                      <Users className="w-4 h-4 mr-2" /> Profile
                    </PixelButton>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:block">
              <div className="relative">
                <div className="race-track-preview bg-gray-900 rounded-lg h-64 relative overflow-hidden">
                  {/* Race track visualization */}
                  <div className="flex justify-between items-center h-full p-4 relative">
                    <div className="absolute bottom-0 left-0 w-full">
                      <div className="grid grid-cols-3 gap-2 p-2">
                        <div className="flex items-center space-x-2 bg-gray-800 p-2 rounded">
                          <ChickenAvatar
                            chickenType="html_auto"
                            jockeyType="html_auto"
                            size="sm"
                          />
                          <span className="text-xs text-white truncate">
                            Player1
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 bg-gray-800 p-2 rounded">
                          <ChickenAvatar
                            chickenType="html_matikah"
                            jockeyType="html_matikah"
                            size="sm"
                          />
                          <span className="text-xs text-white truncate">
                            Player2
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 bg-gray-800 p-2 rounded">
                          <ChickenAvatar
                            chickenType={
                              isLoggedIn
                                ? (profile as any)?.chicken_type || "html_steve"
                                : "html_steve"
                            }
                            jockeyType={
                              isLoggedIn
                                ? (profile as any)?.jockey_type || "html_steve"
                                : "html_steve"
                            }
                            size="sm"
                          />
                          <span className="text-xs text-white truncate">
                            {isLoggedIn
                              ? (profile as any)?.username || "YOU"
                              : "YOU"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Finish line */}
                    <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-r from-transparent to-yellow-500 flex items-center justify-center">
                      <div className="h-full w-4 bg-black/50 flex items-center justify-center">
                        <div className="grid grid-rows-8 h-full w-4">
                          {[...Array(8)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-full h-full ${i % 2 === 0 ? "bg-white" : "bg-black"}`}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
          <div className="mb-8">
            {/* Donation link without static banner */}
            <div className="w-full max-w-xl mb-8">
              <a
                href="https://libme.xyz/cjgift"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg overflow-hidden transition-transform hover:scale-105 bg-purple-900/50 border-2 border-primary p-4"
              >
                <div className="flex items-center justify-center space-x-4">
                  <div className="text-2xl">🎮</div>
                  <div className="text-center">
                    <h3 className="font-pixel text-primary">
                      Support Development
                    </h3>
                    <p className="text-sm text-light">
                      Help fund CJSR app improvements
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full">
            <Card className="bg-dark border-2 border-red-500">
              <CardContent className="p-6 flex flex-col items-center">
                <div className="text-4xl mb-2">🔥</div>
                <h2 className="text-lg font-pixel text-red-400 mb-2">
                  Faction Wars
                </h2>
                <p className="text-light text-center">
                  Join 8-player elemental battles! Choose Fire, Water, Earth,
                  Air, Chaos, Ether, Coin, or Order factions. Each has unique
                  WPM ranges and special abilities.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark border-2 border-blue-500">
              <CardContent className="p-6 flex flex-col items-center">
                <div className="text-4xl mb-2">🥚</div>
                <h2 className="text-lg font-pixel text-blue-400 mb-2">
                  Elemental Eggs
                </h2>
                <p className="text-light text-center">
                  Claim elemental eggs based on your XP! Collect all 8 faction
                  types and unlock legendary Garu mounts to ride into battle.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark border-2 border-purple-500">
              <CardContent className="p-6 flex flex-col items-center">
                <div className="text-4xl mb-2">📖</div>
                <h2 className="text-lg font-pixel text-purple-400 mb-2">
                  Story Campaigns
                </h2>
                <p className="text-light text-center">
                  Experience epic character campaigns with Steve, Auto, Matikah,
                  and Iam. Each hero has 9 unique story races with progressive
                  difficulty.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="w-full p-6 bg-dark border-2 border-primary mb-8">
            <h2 className="text-2xl font-pixel text-primary mb-4">
              How to Play
            </h2>
            <ol className="text-left text-light space-y-2 mb-4">
              <li>1. Join a race lobby</li>
              <li>2. Wait for the countdown to finish</li>
              <li>
                3. Type the displayed prompt as quickly and accurately as
                possible
              </li>
              <li>4. Cross the finish line first to win</li>
              <li>5. Winners get to submit a new prompt for future races</li>
            </ol>
            <PixelButton variant="outline" onClick={() => setLocation("/help")}>
              READ MORE
            </PixelButton>
          </div>

          <div className="w-full p-6 bg-dark border-2 border-primary">
            <h2 className="text-2xl font-pixel text-primary mb-4">
              Character Campaigns
            </h2>
            <p className="text-light mb-6">
              Experience epic story campaigns with unique characters. Complete 5
              races in each campaign to unlock the next character!
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <CharacterCard
                name="Steve & Brutus"
                spriteId="html_steve"
                description="Start your journey with the legendary father figure. Available immediately."
              />
              <CharacterCard
                name="Auto & Timaru"
                spriteId="html_auto"
                description="Unlocks after completing 5 Steve races. The technological champion with golden mount."
                locked
                level={5}
              />
              <CharacterCard
                name="Matikah & Chalisa"
                spriteId="html_matikah"
                description="Unlocks after completing 5 Auto races. The mystical rider with feathered headdress."
                locked
                level={10}
              />
              <CharacterCard
                name="Iam"
                spriteId="html_iam"
                description="Unlocks after completing 5 Matikah races. The enigmatic traveler with mysterious powers."
                locked
                level={15}
              />
              <CharacterCard
                name="Death"
                spriteId="html_death"
                description="Faction Mount: Unlock with 500+ Faction XP in any element."
              />
              <CharacterCard
                name="Golden Champion"
                spriteId="html_golden"
                description="Legendary Mount: Unlock with 1000+ Faction XP in any element."
              />
              <CharacterCard
                name="Peacock Champion"
                spriteId="peacock_champion"
                description="Legendary Jockey & Mount: Unlock with 100000+ Faction XP in any element."
              />
            </div>

            <div className="mt-6 text-center">
              <PixelButton
                variant="outline"
                onClick={() => setLocation("/profile")}
              >
                CUSTOMIZE YOUR CHARACTER
              </PixelButton>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
