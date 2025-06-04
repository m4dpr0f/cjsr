import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Settings, 
  Users, 
  Trophy, 
  Database, 
  Download, 
  Calendar, 
  Palette, 
  FileText, 
  Shield,
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  Crown,
  Zap,
  Star,
  Target
} from 'lucide-react';
import SpriteManager from '@/components/sprite-manager';

interface AdminStats {
  totalUsers: number;
  totalRaces: number;
  totalPrompts: number;
  totalGuilds: number;
  activeSeasons: number;
}

interface Player {
  id: number;
  username: string;
  email?: string;
  xp: number;
  level: number;
  faction: string;
  guild?: string;
  lastActive: string;
  totalRaces: number;
  avgWpm: number;
}

interface Guild {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  totalXp: number;
  leader: string;
  faction: string;
  createdAt: string;
  isActive: boolean;
}

interface Season {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  theme: string;
  isActive: boolean;
  totalParticipants: number;
  totalRaces: number;
}

interface Prompt {
  id: number;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: string;
  author: string;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);
  const [isEditingGuild, setIsEditingGuild] = useState(false);
  const queryClient = useQueryClient();

  // Fetch real admin stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: activeTab === 'overview'
  });

  // Fetch real players data
  const { data: players, isLoading: playersLoading } = useQuery({
    queryKey: ['/api/admin/players'],
    enabled: activeTab === 'players'
  });

  // Update player mutation
  const updatePlayerMutation = useMutation({
    mutationFn: async ({ id, xp, faction }: { id: number; xp: number; faction: string }) => {
      return apiRequest('PUT', `/api/admin/players/${id}/xp`, { xp, faction });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/players'] });
      setSelectedPlayer(null);
    }
  });

  // Boost XP mutation
  const boostXpMutation = useMutation({
    mutationFn: async ({ id, amount, faction }: { id: number; amount: number; faction: string }) => {
      return apiRequest('POST', `/api/admin/boost-xp/${id}`, { amount, faction });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/players'] });
    }
  });

const mockGuilds: Guild[] = [
  { id: 1, name: 'Order Knights', description: 'Elite guild of Order faction masters', memberCount: 15, totalXp: 89000000, leader: 'TimeKnot', faction: 'd100', createdAt: '2025-01-15', isActive: true },
  { id: 2, name: 'Coin Masters', description: 'Merchants and traders unite', memberCount: 8, totalXp: 15600, leader: 'Skeletor', faction: 'd2', createdAt: '2025-01-20', isActive: true },
];

const mockSeasons: Season[] = [
  { id: 1, name: 'Season of Trust No One', description: 'First official season featuring the Trust No One trilogy', startDate: '2025-01-15', endDate: '2025-03-15', theme: 'Mystery & Deception', isActive: true, totalParticipants: 234, totalRaces: 1456 },
];

const mockPrompts: Prompt[] = [
  { id: 1, text: 'The quick brown fox jumps over the lazy dog', difficulty: 'easy', category: 'pangram', author: 'System', usageCount: 156, isActive: true, createdAt: '2025-01-15' },
  { id: 2, text: 'In the shadowy corridors of power, where whispers carry more weight than shouted declarations...', difficulty: 'hard', category: 'Trust No One', author: 'Campaign', usageCount: 89, isActive: true, createdAt: '2025-01-16' },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);
  const [isEditingGuild, setIsEditingGuild] = useState(false);

  const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number | string; icon: any; color: string }) => (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  const exportData = (type: string) => {
    // Implementation for data export
    console.log(`Exporting ${type} data...`);
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-minecraft text-yellow-500">CJSR Admin Panel</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportData('all')}>
              <Download className="w-4 h-4 mr-2" />
              Export All Data
            </Button>
            <Button className="bg-red-600 hover:bg-red-700">
              <Shield className="w-4 h-4 mr-2" />
              Emergency Stop
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="guilds">Guilds</TabsTrigger>
            <TabsTrigger value="seasons">Seasons</TabsTrigger>
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
            <TabsTrigger value="sprites">Sprites</TabsTrigger>
            <TabsTrigger value="eggs">Garu Eggs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard title="Total Users" value={statsLoading ? '...' : stats?.totalUsers || 0} icon={Users} color="text-blue-400" />
              <StatCard title="Total Races" value={statsLoading ? '...' : stats?.totalRaces || 0} icon={Trophy} color="text-green-400" />
              <StatCard title="Prompts" value={statsLoading ? '...' : stats?.totalPrompts || 0} icon={FileText} color="text-purple-400" />
              <StatCard title="Active Guilds" value={statsLoading ? '...' : stats?.totalGuilds || 0} icon={Shield} color="text-orange-400" />
              <StatCard title="Active Seasons" value={statsLoading ? '...' : stats?.activeSeasons || 0} icon={Calendar} color="text-yellow-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-yellow-500">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                      <span className="text-gray-300">TimeKnot completed a race</span>
                      <span className="text-gray-500 text-sm">2 minutes ago</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                      <span className="text-gray-300">New guild "Fire Runners" created</span>
                      <span className="text-gray-500 text-sm">15 minutes ago</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                      <span className="text-gray-300">Season "Trust No One" milestone reached</span>
                      <span className="text-gray-500 text-sm">1 hour ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-yellow-500">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-12">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Prompt
                    </Button>
                    <Button variant="outline" className="h-12">
                      <Calendar className="w-4 h-4 mr-2" />
                      New Season
                    </Button>
                    <Button variant="outline" className="h-12">
                      <Crown className="w-4 h-4 mr-2" />
                      Elite Unlock
                    </Button>
                    <Button variant="outline" className="h-12">
                      <Database className="w-4 h-4 mr-2" />
                      Backup DB
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="players" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-minecraft text-yellow-500">Player Management</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => exportData('players')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Players
                </Button>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Player
                </Button>
              </div>
            </div>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>XP</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Faction</TableHead>
                      <TableHead>Guild</TableHead>
                      <TableHead>Races</TableHead>
                      <TableHead>Avg WPM</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {playersLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">Loading players...</TableCell>
                      </TableRow>
                    ) : (players || []).map((player: any) => (
                      <TableRow key={player.id}>
                        <TableCell className="font-medium">{player.username}</TableCell>
                        <TableCell>{player.xp?.toLocaleString() || 0}</TableCell>
                        <TableCell>{player.level || 1}</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-600">{(player.faction || 'd4').toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>{player.guild || 'None'}</TableCell>
                        <TableCell>{player.totalRaces || 0}</TableCell>
                        <TableCell>{player.avgWpm || 0}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => setSelectedPlayer(player)}>
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {selectedPlayer && (
              <Dialog open={!!selectedPlayer} onOpenChange={() => setSelectedPlayer(null)}>
                <DialogContent className="bg-gray-800 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-yellow-500">Edit Player: {selectedPlayer.username}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">XP</label>
                      <Input defaultValue={selectedPlayer.xp} className="bg-gray-700 border-gray-600" />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Faction</label>
                      <Select defaultValue={selectedPlayer.faction}>
                        <SelectTrigger className="bg-gray-700 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="d2">D2 - Electric</SelectItem>
                          <SelectItem value="d4">D4 - Fire</SelectItem>
                          <SelectItem value="d6">D6 - Earth</SelectItem>
                          <SelectItem value="d8">D8 - Air</SelectItem>
                          <SelectItem value="d10">D10 - Chaos</SelectItem>
                          <SelectItem value="d12">D12 - Ether</SelectItem>
                          <SelectItem value="d20">D20 - Water</SelectItem>
                          <SelectItem value="d100">D100 - Order</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button className="bg-green-600 hover:bg-green-700">Save Changes</Button>
                      <Button variant="outline" onClick={() => setSelectedPlayer(null)}>Cancel</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>

          <TabsContent value="guilds" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-minecraft text-yellow-500">Guild Management</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => exportData('guilds')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Guilds
                </Button>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Guild
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockGuilds.map((guild) => (
                <Card key={guild.id} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-yellow-500">{guild.name}</CardTitle>
                      <Badge className={guild.isActive ? 'bg-green-600' : 'bg-red-600'}>
                        {guild.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-gray-300 text-sm">{guild.description}</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Members:</span>
                        <span className="text-white">{guild.memberCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total XP:</span>
                        <span className="text-white">{guild.totalXp.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Leader:</span>
                        <span className="text-white">{guild.leader}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Faction:</span>
                        <Badge className="bg-blue-600">{guild.faction.toUpperCase()}</Badge>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="seasons" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-minecraft text-yellow-500">Season Management</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Season
              </Button>
            </div>

            <div className="space-y-4">
              {mockSeasons.map((season) => (
                <Card key={season.id} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-yellow-500">{season.name}</CardTitle>
                      <Badge className={season.isActive ? 'bg-green-600' : 'bg-gray-600'}>
                        {season.isActive ? 'Active' : 'Ended'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-300 mb-3">{season.description}</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Start Date:</span>
                            <span className="text-white">{season.startDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">End Date:</span>
                            <span className="text-white">{season.endDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Theme:</span>
                            <span className="text-white">{season.theme}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Participants:</span>
                            <span className="text-white">{season.totalParticipants}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Total Races:</span>
                            <span className="text-white">{season.totalRaces}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="prompts" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-minecraft text-yellow-500">Prompt Management</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => exportData('prompts')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Prompts
                </Button>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Prompt
                </Button>
              </div>
            </div>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Text Preview</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPrompts.map((prompt) => (
                      <TableRow key={prompt.id}>
                        <TableCell className="max-w-xs truncate">{prompt.text}</TableCell>
                        <TableCell>
                          <Badge className={
                            prompt.difficulty === 'easy' ? 'bg-green-600' :
                            prompt.difficulty === 'medium' ? 'bg-yellow-600' :
                            prompt.difficulty === 'hard' ? 'bg-orange-600' : 'bg-red-600'
                          }>
                            {prompt.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>{prompt.category}</TableCell>
                        <TableCell>{prompt.author}</TableCell>
                        <TableCell>{prompt.usageCount}</TableCell>
                        <TableCell>
                          <Badge className={prompt.isActive ? 'bg-green-600' : 'bg-gray-600'}>
                            {prompt.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sprites" className="space-y-4">
            <SpriteManager />
          </TabsContent>

          <TabsContent value="eggs" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-minecraft text-yellow-500">Garu Egg Management</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Egg Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-yellow-500">Fire Garu Egg</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Rarity:</span>
                      <Badge className="bg-orange-600">Epic</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Base Stats:</span>
                      <span className="text-white">Speed +15</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Drop Rate:</span>
                      <span className="text-white">5%</span>
                    </div>
                    <Button size="sm" variant="outline" className="w-full mt-3">
                      <Edit className="w-3 h-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-yellow-500">Game Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Base XP Multiplier</label>
                    <Input defaultValue="1.0" className="bg-gray-700 border-gray-600" />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Elite Unlock XP Threshold</label>
                    <Input defaultValue="1000" className="bg-gray-700 border-gray-600" />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Max Guild Size</label>
                    <Input defaultValue="50" className="bg-gray-700 border-gray-600" />
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-yellow-500">Database Operations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full" onClick={() => exportData('database')}>
                    <Download className="w-4 h-4 mr-2" />
                    Full Database Backup
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Database className="w-4 h-4 mr-2" />
                    Optimize Database
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    Clear Cache
                  </Button>
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Reset Race Stats
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}