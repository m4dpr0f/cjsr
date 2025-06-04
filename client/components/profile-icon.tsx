import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";
import { getUserProgress } from "@/lib/single-player";
import { getLevelFromXp } from "@/lib/utils";
import { PixelButton } from "@/components/ui/pixel-button";
import { useToast } from "@/hooks/use-toast";

export function ProfileIcon() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Query profile data
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['/api/profile'],
    retry: false,
    staleTime: 60000, // 1 minute
  });

  // Handle logout
  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      queryClient.setQueryData(['/api/profile'], null);
      setIsDropdownOpen(false);
      setLocation('/login');
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "There was a problem logging out",
        variant: "destructive",
      });
    }
  };

  // Get level info for display - use XP from profile if available, otherwise local progress
  const progress = getUserProgress();
  const currentXp = profile?.xp ?? progress.xp;
  const level = Math.floor(currentXp / 100);

  const isLoggedIn = !!profile;

  return (
    <div className="relative">
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button 
            className={`flex items-center justify-center h-12 w-12 rounded-full cursor-pointer transition-all duration-300 ${isLoggedIn ? 'hover:ring-2 hover:ring-primary' : 'hover:ring-2 hover:ring-secondary'}`}
            aria-label="Profile menu"
          >
            {isLoading ? (
              <div className="h-10 w-10 rounded-full bg-dark animate-pulse"></div>
            ) : isLoggedIn ? (
              <div className="h-12 w-12">
                <ChickenAvatar
                  chickenType={profile && profile.chicken_type ? profile.chicken_type : "white"}
                  jockeyType={profile && profile.jockey_type ? profile.jockey_type : "steve"}
                  size="sm"
                  showName={false}
                />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-dark flex items-center justify-center border-2 border-primary">
                <span className="text-primary text-xl font-minecraft">?</span>
              </div>
            )}
          </button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-64 mr-4 font-minecraft">
          {isLoggedIn ? (
            <>
              <DropdownMenuLabel className="text-primary">
                {profile && profile.username ? profile.username : "Player"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Level:</span>
                  <span className="text-primary">{level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">XP:</span>
                  <span className="text-primary">{profile?.xp || 0}</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  Character Record
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-500 focus:text-red-500 cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuLabel className="text-secondary">
                Not Logged In
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-2 flex flex-col gap-2">
                <PixelButton 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setLocation('/login');
                  }}
                  className="w-full"
                  size="sm"
                >
                  Login
                </PixelButton>
                <PixelButton 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setLocation('/register');
                  }}
                  className="w-full"
                  variant="outline"
                  size="sm"
                >
                  Register
                </PixelButton>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Indicator dot for login status */}
      <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-dark ${isLoggedIn ? 'bg-green-500' : 'bg-red-500'}`}></div>
    </div>
  );
}