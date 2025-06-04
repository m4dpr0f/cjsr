import { Link, useLocation } from "wouter";
import { PixelButton } from "@/components/ui/pixel-button";
import { ProfileIcon } from "@/components/profile-icon";
import scribeRacerLogo from "../assets/scribe-racer-logo.png";

export function Header() {
  const [location] = useLocation();

  return (
    <header className="bg-dark px-4 py-2 border-b-4 border-primary">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex justify-between w-full md:w-auto items-center mb-4 md:mb-0">
          <Link href="/" className="flex items-center">
            <img
              src={scribeRacerLogo}
              alt="Chicken Jockey Scribe Racer Logo"
              className="h-16 mr-2"
            />
            <span className="text-xs text-primary font-pixel">
              Chicken Jockey Scribe Racer v1.4.5
            </span>
          </Link>

          {/* Profile icon shown on mobile */}
          <div className="md:hidden">
            <ProfileIcon />
          </div>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto mt-2 md:mt-0">
          <div className="grid grid-cols-3 gap-2 sm:flex sm:space-x-2">
            <Link href="/">
              <PixelButton
                variant={location === "/" ? "default" : "outline"}
                className="w-full"
              >
                HOME
              </PixelButton>
            </Link>
            <Link href="/race">
              <PixelButton
                variant={location === "/race" ? "default" : "outline"}
                className="w-full"
              >
                RACE
              </PixelButton>
            </Link>
            <Link href="/help">
              <PixelButton
                variant={location === "/help" ? "default" : "outline"}
                className="w-full"
              >
                HELP
              </PixelButton>
            </Link>
            <Link href="/downloads">
              <PixelButton
                variant={location === "/downloads" ? "default" : "outline"}
                className="w-full"
              >
                DOWNLOADS
              </PixelButton>
            </Link>

            <Link href="/leaderboard">
              <PixelButton
                variant={location === "/leaderboard" ? "default" : "outline"}
                className="w-full"
              >
                RANKS
              </PixelButton>
            </Link>
            <Link href="/profile">
              <PixelButton
                variant={location === "/profile" ? "default" : "outline"}
                className="w-full"
              >
                PROFILE
              </PixelButton>
            </Link>

            {/* Profile icon shown on desktop */}
            <div className="hidden md:flex items-center ml-2">
              <ProfileIcon />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
