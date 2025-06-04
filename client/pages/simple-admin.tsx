import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Users, Trophy, Settings, Edit, Download, Activity, Zap, Crown, Gamepad2, BarChart3, Calendar, UserCheck, AlertTriangle } from 'lucide-react';

interface Player {
  id: number;
  username: string;
  email?: string;
  xp: number;
  level: number;
  faction: string;
  totalRaces: number;
  avgWpm: number;
  lastActive: string;
}

export default function SimpleAdmin() {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [editXp, setEditXp] = useState('');
  const [editFaction, setEditFaction] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  // Enhanced mock data for preview demonstration
  const mockStats = {
    totalUsers: 1247,
    totalRaces: 8932,
    totalGuilds: 23,
    activeSeasons: 2,
    dailyActiveUsers: 342,
    avgSessionTime: 18.7,
    totalPrompts: 156,
    activeCampaigns: 4
  };

  const mockPlayers = [
    { id: 1, username: 'DragonSlayer', email: 'dragon@test.com', xp: 95000, level: 47, faction: 'd100', totalRaces: 234, avgWpm: 95 },
    { id: 2, username: 'NinjaTyper', email: 'ninja@test.com', xp: 78500, level: 42, faction: 'd20', totalRaces: 189, avgWpm: 87 },
    { id: 3, username: 'Sylvanus', email: 'agilexp@gmail.com', xp: 1779, level: 8, faction: 'd4', totalRaces: 45, avgWpm: 68 },
    { id: 4, username: 'TimeKnot', email: 'timeknot@example.com', xp: 77777777, level: 999, faction: 'd100', totalRaces: 1567, avgWpm: 142 },
    { id: 5, username: 'FireMaster', email: 'fire@test.com', xp: 45600, level: 35, faction: 'd4', totalRaces: 156, avgWpm: 76 },
    { id: 6, username: 'AirBender', email: 'air@test.com', xp: 32100, level: 28, faction: 'd8', totalRaces: 98, avgWpm: 72 },
    { id: 7, username: 'EarthShaker', email: 'earth@test.com', xp: 67800, level: 39, faction: 'd6', totalRaces: 201, avgWpm: 89 },
    { id: 8, username: 'ChaosKnight', email: 'chaos@test.com', xp: 89200, level: 44, faction: 'd10', totalRaces: 278, avgWpm: 91 }
  ];

  const mockRecentActivity = [
    { type: 'race_completed', player: 'TimeKnot', details: 'Won private race with 142 WPM', timestamp: '2 minutes ago' },
    { type: 'level_up', player: 'Sylvanus', details: 'Reached level 8 in D4 Fire faction', timestamp: '15 minutes ago' },
    { type: 'guild_joined', player: 'NinjaTyper', details: 'Joined "Speed Demons" guild', timestamp: '1 hour ago' },
    { type: 'campaign_progress', player: 'DragonSlayer', details: 'Completed Steve Campaign Chapter 3', timestamp: '2 hours ago' },
    { type: 'new_user', player: 'EtherMage', details: 'Created account and joined D12 Ether', timestamp: '3 hours ago' }
  ];

  // Fetch real data with fallback to mock for preview
  const { data: stats = mockStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats']
  });

  const { data: players = mockPlayers, isLoading: playersLoading } = useQuery({
    queryKey: ['/api/admin/players']
  });

  // Update player XP
  const updatePlayerMutation = useMutation({
    mutationFn: async ({ id, xp, faction }: { id: number; xp: number; faction: string }) => {
      return apiRequest('PUT', `/api/admin/players/${id}/xp`, { xp, faction });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/players'] });
      setSelectedPlayer(null);
      setEditXp('');
      setEditFaction('');
    }
  });

  // Boost XP
  const boostXpMutation = useMutation({
    mutationFn: async ({ id, amount, faction }: { id: number; amount: number; faction: string }) => {
      return apiRequest('POST', `/api/admin/boost-xp/${id}`, { amount, faction });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/players'] });
    }
  });

  const handleEditPlayer = (player: Player) => {
    setSelectedPlayer(player);
    setEditXp(player.xp.toString());
    setEditFaction(player.faction);
  };

  const handleUpdatePlayer = () => {
    if (selectedPlayer && editXp && editFaction) {
      updatePlayerMutation.mutate({
        id: selectedPlayer.id,
        xp: parseInt(editXp),
        faction: editFaction
      });
    }
  };

  const handleBoostXp = (playerId: number, amount: number, faction: string) => {
    boostXpMutation.mutate({ id: playerId, amount, faction });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-yellow-400 mb-2">CJSR ADMIN PANEL</h1>
            <p className="text-slate-300">Manage your Chicken Jockey Scribe Racer universe</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Users</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {statsLoading ? '...' : stats.totalUsers.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-400">+12% this month</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Races</p>
                      <p className="text-2xl font-bold text-green-400">
                        {statsLoading ? '...' : stats.totalRaces.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-400">+8% this week</p>
                    </div>
                    <Trophy className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Daily Active</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {statsLoading ? '...' : stats.dailyActiveUsers}
                      </p>
                      <p className="text-xs text-yellow-400">Peak: 487</p>
                    </div>
                    <Activity className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Avg Session</p>
                      <p className="text-2xl font-bold text-yellow-400">
                        {statsLoading ? '...' : `${stats.avgSessionTime}m`}
                      </p>
                      <p className="text-xs text-green-400">+2.3m vs last week</p>
                    </div>
                    <Calendar className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-xs">Active Guilds</p>
                      <p className="text-lg font-bold text-cyan-400">{stats.totalGuilds}</p>
                    </div>
                    <Users className="w-6 h-6 text-cyan-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-xs">Text Prompts</p>
                      <p className="text-lg font-bold text-orange-400">{stats.totalPrompts}</p>
                    </div>
                    <Edit className="w-6 h-6 text-orange-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-xs">Active Seasons</p>
                      <p className="text-lg font-bold text-pink-400">{stats.activeSeasons}</p>
                    </div>
                    <Crown className="w-6 h-6 text-pink-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-xs">Campaigns</p>
                      <p className="text-lg font-bold text-indigo-400">{stats.activeCampaigns}</p>
                    </div>
                    <Gamepad2 className="w-6 h-6 text-indigo-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Feed */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-slate-700 rounded-lg">
                      <div className={`w-3 h-3 rounded-full mt-1 ${
                        activity.type === 'race_completed' ? 'bg-green-500' :
                        activity.type === 'level_up' ? 'bg-yellow-500' :
                        activity.type === 'guild_joined' ? 'bg-blue-500' :
                        activity.type === 'campaign_progress' ? 'bg-purple-500' :
                        'bg-cyan-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-white">{activity.player}</p>
                          <p className="text-xs text-slate-400">{activity.timestamp}</p>
                        </div>
                        <p className="text-sm text-slate-300 mt-1">{activity.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Faction Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-yellow-400 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Faction Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { faction: 'D100 Order', players: 234, color: 'bg-purple-500', percentage: 18.8 },
                      { faction: 'D20 Water', players: 198, color: 'bg-blue-500', percentage: 15.9 },
                      { faction: 'D4 Fire', players: 187, color: 'bg-red-500', percentage: 15.0 },
                      { faction: 'D6 Earth', players: 156, color: 'bg-green-500', percentage: 12.5 },
                      { faction: 'D10 Chaos', players: 143, color: 'bg-pink-500', percentage: 11.5 },
                      { faction: 'D8 Air', players: 132, color: 'bg-cyan-500', percentage: 10.6 },
                      { faction: 'D12 Ether', players: 109, color: 'bg-indigo-500', percentage: 8.7 },
                      { faction: 'D2 Electric', players: 88, color: 'bg-yellow-500', percentage: 7.0 }
                    ].map((faction, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">{faction.faction}</span>
                          <span className="text-sm text-slate-400">{faction.players} players</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${faction.color}`}
                            style={{ width: `${faction.percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-slate-500 text-right">{faction.percentage}%</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-yellow-400 flex items-center">
                    <Crown className="w-5 h-5 mr-2" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'TimeKnot', wpm: 142, level: 999, faction: 'D100', rank: 1 },
                      { name: 'DragonSlayer', wpm: 95, level: 47, faction: 'D100', rank: 2 },
                      { name: 'ChaosKnight', wpm: 91, level: 44, faction: 'D10', rank: 3 },
                      { name: 'EarthShaker', wpm: 89, level: 39, faction: 'D6', rank: 4 },
                      { name: 'NinjaTyper', wpm: 87, level: 42, faction: 'D20', rank: 5 }
                    ].map((player, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            player.rank === 1 ? 'bg-yellow-500 text-black' :
                            player.rank === 2 ? 'bg-gray-400 text-black' :
                            player.rank === 3 ? 'bg-orange-500 text-black' :
                            'bg-slate-600 text-white'
                          }`}>
                            {player.rank}
                          </div>
                          <div>
                            <div className="text-white font-medium">{player.name}</div>
                            <div className="text-xs text-slate-400">{player.faction} • Level {player.level}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold">{player.wpm} WPM</div>
                          <div className="text-xs text-slate-400">This week</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Campaign Progress */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <Gamepad2 className="w-5 h-5 mr-2" />
                  Campaign Progress Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Steve Campaign', completion: 67, players: 423, color: 'bg-blue-500' },
                    { name: 'Auto Campaign', completion: 45, players: 387, color: 'bg-green-500' },
                    { name: 'Matikah Campaign', completion: 32, players: 298, color: 'bg-purple-500' },
                    { name: 'Iam Campaign', completion: 23, players: 234, color: 'bg-red-500' }
                  ].map((campaign, index) => (
                    <div key={index} className="p-4 bg-slate-700 rounded-lg">
                      <h4 className="text-sm font-medium text-white mb-2">{campaign.name}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">Avg Progress</span>
                          <span className="text-sm font-bold text-yellow-400">{campaign.completion}%</span>
                        </div>
                        <Progress value={campaign.completion} className="h-2" />
                        <div className="text-xs text-slate-500">{campaign.players} active players</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="players" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-yellow-400">Player Management</CardTitle>
              </CardHeader>
              <CardContent>
                {playersLoading ? (
                  <p className="text-center py-4">Loading players...</p>
                ) : (
                  <div className="space-y-4">
                    {(players || []).map((player: Player) => (
                      <div key={player.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-bold text-lg">{player.username}</h3>
                            <p className="text-sm text-slate-400">{player.email || 'No email'}</p>
                          </div>
                          <Badge className="bg-blue-600">{player.faction?.toUpperCase()}</Badge>
                          <div className="text-sm">
                            <p>XP: {player.xp?.toLocaleString() || 0}</p>
                            <p>Races: {player.totalRaces || 0}</p>
                            <p>WPM: {player.avgWpm || 0}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleEditPlayer(player)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleBoostXp(player.id, 1000, player.faction || 'd4')}
                          >
                            +1K XP
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleBoostXp(player.id, 10000, player.faction || 'd4')}
                          >
                            +10K XP
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedPlayer && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-yellow-400">Edit {selectedPlayer.username}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="xp">XP Amount</Label>
                    <Input
                      id="xp"
                      value={editXp}
                      onChange={(e) => setEditXp(e.target.value)}
                      placeholder="Enter XP amount"
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="faction">Faction</Label>
                    <Select value={editFaction} onValueChange={setEditFaction}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Select faction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="d2">D2 Electric</SelectItem>
                        <SelectItem value="d4">D4 Fire</SelectItem>
                        <SelectItem value="d6">D6 Earth</SelectItem>
                        <SelectItem value="d8">D8 Air</SelectItem>
                        <SelectItem value="d10">D10 Chaos</SelectItem>
                        <SelectItem value="d12">D12 Ether</SelectItem>
                        <SelectItem value="d20">D20 Water</SelectItem>
                        <SelectItem value="d100">D100 Order</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdatePlayer} disabled={updatePlayerMutation.isPending}>
                      {updatePlayerMutation.isPending ? 'Updating...' : 'Update Player'}
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedPlayer(null)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-yellow-400">Admin Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => window.open('/api/admin/export/players', '_blank')}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Player Data
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}