import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Share2, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialShareProps {
  achievement: {
    type: 'race_win' | 'chapter_complete' | 'faction_milestone' | 'leaderboard_rank';
    playerName: string;
    details: string;
    stats?: {
      wpm?: number;
      accuracy?: number;
      placement?: number;
      xp?: number;
      faction?: string;
    };
    chickenName?: string;
    jockeyType?: string;
  };
}

export function SocialShare({ achievement }: SocialShareProps) {
  const [showShare, setShowShare] = useState(false);
  const { toast } = useToast();

  const generateShareText = () => {
    const baseUrl = window.location.origin;
    const { type, playerName, details, stats, chickenName, jockeyType } = achievement;

    let shareText = '';
    let hashtags = '#ChickenJockeyScribeRacer #TypingGame #CJSR';

    switch (type) {
      case 'race_win':
        shareText = `🏆 ${playerName} just won a race in Chicken Jockey Scribe Racer!
${details}
${stats?.wpm ? `⚡ ${stats.wpm} WPM` : ''} ${stats?.accuracy ? `🎯 ${stats.accuracy}% accuracy` : ''}
${chickenName ? `🐔 Riding: ${chickenName}` : ''} ${jockeyType ? `(${jockeyType})` : ''}

Join the epic typing races at: ${baseUrl}`;
        hashtags += ' #RaceWin #TypingRace';
        break;

      case 'chapter_complete':
        shareText = `📚 ${playerName} just completed "${details}" in the Learn to Type Adventure!
${chickenName ? `🐔 With companion: ${chickenName}` : ''}
${stats?.xp ? `✨ Earned ${stats.xp} XP` : ''}

Master sacred texts from 12 languages at: ${baseUrl}`;
        hashtags += ' #LearnToType #SacredTexts';
        break;

      case 'faction_milestone':
        shareText = `⚡ ${playerName} achieved a major ${stats?.faction?.toUpperCase()} faction milestone!
${details}
${stats?.xp ? `🔥 Total XP: ${stats.xp}` : ''}

Choose your elemental faction and compete at: ${baseUrl}`;
        hashtags += ' #FactionWars #ElementalPower';
        break;

      case 'leaderboard_rank':
        shareText = `🌟 ${playerName} just ranked #${stats?.placement} on the global leaderboard!
${details}
${stats?.wpm ? `⚡ ${stats.wpm} WPM average` : ''} ${stats?.accuracy ? `🎯 ${stats.accuracy}% accuracy` : ''}

Think you can beat them? Race at: ${baseUrl}`;
        hashtags += ' #Leaderboard #TypingChampion';
        break;
    }

    return `${shareText}\n\n${hashtags}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      toast({
        title: "Copied to clipboard!",
        description: "Share this achievement with your friends",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please manually copy the text",
        variant: "destructive"
      });
    }
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareToDiscord = () => {
    // Open Discord share dialog
    copyToClipboard();
    toast({
      title: "Ready for Discord!",
      description: "Text copied - paste it in your Discord server",
    });
  };

  if (!showShare) {
    return (
      <Button
        onClick={() => setShowShare(true)}
        variant="outline"
        size="sm"
        className="bg-blue-600/20 border-blue-500 text-blue-300 hover:bg-blue-600/30"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share Achievement
      </Button>
    );
  }

  return (
    <Card className="mt-4 bg-gray-800/50 border-blue-500/30">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-blue-300">Share Your Achievement</h3>
          <Button
            onClick={() => setShowShare(false)}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            ✕
          </Button>
        </div>
        
        <div className="bg-gray-900 p-3 rounded text-sm text-gray-300 mb-4 max-h-32 overflow-y-auto">
          {generateShareText()}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={copyToClipboard}
            size="sm"
            className="bg-gray-600 hover:bg-gray-500"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Text
          </Button>
          
          <Button
            onClick={shareToTwitter}
            size="sm"
            className="bg-blue-500 hover:bg-blue-400"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Twitter
          </Button>
          
          <Button
            onClick={shareToDiscord}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Discord
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}