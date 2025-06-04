import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, Eye } from 'lucide-react';

interface SpriteData {
  id: string;
  name: string;
  type: 'jockey' | 'mount';
  category: 'default' | 'faction' | 'elite' | 'campaign' | 'special';
  htmlContent: string;
  description: string;
  unlockCondition?: string;
  createdAt: Date;
}

const defaultSprites: SpriteData[] = [
  {
    id: 'zombie_jockey',
    name: 'Zombie Jockey',
    type: 'jockey',
    category: 'default',
    htmlContent: `<div class="zombie-jockey" style="position: relative; width: 16px; height: 24px;">
      <div style="position: absolute; top: 4px; left: 6px; width: 6px; height: 8px; background: #6B7280; border: 1px solid #4B5563;"></div>
      <div style="position: absolute; top: 2px; left: 7px; width: 4px; height: 4px; background: #374151; border: 1px solid #1F2937;"></div>
      <div style="position: absolute; top: 6px; left: 7px; width: 1px; height: 1px; background: #EF4444;"></div>
      <div style="position: absolute; top: 6px; left: 9px; width: 1px; height: 1px; background: #EF4444;"></div>
    </div>`,
    description: 'Default undead starter character',
    createdAt: new Date()
  },
  {
    id: 'golden_champion',
    name: 'Golden Champion',
    type: 'jockey',
    category: 'elite',
    htmlContent: `<div class="golden-champion" style="position: relative; width: 16px; height: 24px;">
      <div style="position: absolute; top: 4px; left: 6px; width: 6px; height: 8px; background: #FFA726; border: 1px solid #FF8F00;"></div>
      <div style="position: absolute; top: 2px; left: 7px; width: 4px; height: 4px; background: #FFD700; border: 1px solid #FFA000;"></div>
      <div style="position: absolute; top: 6px; left: 7px; width: 1px; height: 1px; background: #1976D2;"></div>
      <div style="position: absolute; top: 6px; left: 9px; width: 1px; height: 1px; background: #1976D2;"></div>
    </div>`,
    description: 'Elite golden warrior (900+ XP)',
    unlockCondition: '900+ Faction XP',
    createdAt: new Date()
  },
  {
    id: 'peacock_champion',
    name: 'Peacock Champion',
    type: 'jockey',
    category: 'elite',
    htmlContent: `<div class="peacock-champion" style="position: relative; width: 16px; height: 24px;">
      <div style="position: absolute; top: 4px; left: 6px; width: 6px; height: 8px; background: #1A237E; border: 1px solid #0D47A1;"></div>
      <div style="position: absolute; top: 2px; left: 7px; width: 4px; height: 4px; background: #000000; border: 1px solid #333333;"></div>
      <div style="position: absolute; top: 6px; left: 7px; width: 1px; height: 1px; background: #FFD700;"></div>
      <div style="position: absolute; top: 6px; left: 9px; width: 1px; height: 1px; background: #FFD700;"></div>
      <div style="position: absolute; top: 11px; left: 7px; width: 4px; height: 2px; background: linear-gradient(90deg, #4A148C, #10B981); border-radius: 50%;"></div>
    </div>`,
    description: 'Ultra elite peacock warrior (1000+ XP)',
    unlockCondition: '1000+ Faction XP',
    createdAt: new Date()
  },
  {
    id: 'peacock_mount',
    name: 'Peacock Mount',
    type: 'mount',
    category: 'elite',
    htmlContent: `<div class="peacock-mount" style="position: relative; width: 48px; height: 32px;">
      <div style="position: absolute; bottom: 0; left: 8px; width: 32px; height: 4px; background: rgba(0,0,0,0.3); border-radius: 50%;"></div>
      <div style="position: absolute; top: 8px; left: 12px; width: 24px; height: 16px; background: linear-gradient(45deg, #10b981, #3b82f6); border: 2px solid #059669;"></div>
      <div style="position: absolute; top: 6px; left: 32px; width: 12px; height: 20px; background: linear-gradient(135deg, #8b5cf6, #10b981, #3b82f6, #f59e0b); border-radius: 0 50% 50% 0;"></div>
      <div style="position: absolute; top: 10px; left: 36px; width: 3px; height: 3px; background: #1e40af; border: 1px solid #f59e0b; border-radius: 50%;"></div>
      <div style="position: absolute; top: 16px; left: 38px; width: 3px; height: 3px; background: #1e40af; border: 1px solid #f59e0b; border-radius: 50%;"></div>
      <div style="position: absolute; top: 4px; left: 8px; width: 12px; height: 10px; background: #059669; border: 2px solid #047857;"></div>
      <div style="position: absolute; top: 0px; left: 10px; width: 2px; height: 6px; background: #8b5cf6;"></div>
    </div>`,
    description: 'Magnificent peacock Garu with iridescent plumage',
    unlockCondition: '1000+ Faction XP',
    createdAt: new Date()
  }
];

export default function SpriteManager() {
  const [sprites, setSprites] = useState<SpriteData[]>(defaultSprites);
  const [editingSprite, setEditingSprite] = useState<SpriteData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'jockey' as 'jockey' | 'mount',
    category: 'default' as SpriteData['category'],
    htmlContent: '',
    description: '',
    unlockCondition: ''
  });

  const handleCreate = () => {
    setIsCreating(true);
    setEditingSprite(null);
    setFormData({
      name: '',
      type: 'jockey',
      category: 'default',
      htmlContent: '',
      description: '',
      unlockCondition: ''
    });
  };

  const handleEdit = (sprite: SpriteData) => {
    setEditingSprite(sprite);
    setIsCreating(false);
    setFormData({
      name: sprite.name,
      type: sprite.type,
      category: sprite.category,
      htmlContent: sprite.htmlContent,
      description: sprite.description,
      unlockCondition: sprite.unlockCondition || ''
    });
  };

  const handleSave = () => {
    const newSprite: SpriteData = {
      id: editingSprite?.id || `${formData.type}_${Date.now()}`,
      ...formData,
      createdAt: editingSprite?.createdAt || new Date()
    };

    if (editingSprite) {
      setSprites(sprites.map(s => s.id === editingSprite.id ? newSprite : s));
    } else {
      setSprites([...sprites, newSprite]);
    }

    setIsCreating(false);
    setEditingSprite(null);
  };

  const handleDelete = (id: string) => {
    setSprites(sprites.filter(s => s.id !== id));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'default': return 'bg-gray-500';
      case 'faction': return 'bg-blue-500';
      case 'elite': return 'bg-purple-500';
      case 'campaign': return 'bg-green-500';
      case 'special': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-minecraft text-yellow-500">Sprite Management System</h1>
          <Button onClick={handleCreate} className="bg-yellow-600 hover:bg-yellow-700">
            <Plus className="w-4 h-4 mr-2" />
            Create New Sprite
          </Button>
        </div>

        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gallery">Sprite Gallery</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sprites.map((sprite) => (
                <Card key={sprite.id} className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-yellow-500 text-lg">{sprite.name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge className={getCategoryColor(sprite.category)}>
                          {sprite.category}
                        </Badge>
                        <Badge variant="outline">
                          {sprite.type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col space-y-3">
                      <div className="bg-gray-700 p-4 rounded flex justify-center items-center h-20">
                        <div dangerouslySetInnerHTML={{ __html: sprite.htmlContent }} />
                      </div>
                      <p className="text-gray-300 text-sm">{sprite.description}</p>
                      {sprite.unlockCondition && (
                        <p className="text-blue-400 text-xs">Unlock: {sprite.unlockCondition}</p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(sprite)}
                          className="flex-1"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(sprite.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            {(isCreating || editingSprite) ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-yellow-500">
                    {editingSprite ? `Edit ${editingSprite.name}` : 'Create New Sprite'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Name</label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Enter sprite name"
                          className="bg-gray-700 border-gray-600"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Type</label>
                        <Select value={formData.type} onValueChange={(value: 'jockey' | 'mount') => setFormData({...formData, type: value})}>
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="jockey">Jockey</SelectItem>
                            <SelectItem value="mount">Mount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Category</label>
                        <Select value={formData.category} onValueChange={(value: SpriteData['category']) => setFormData({...formData, category: value})}>
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="faction">Faction</SelectItem>
                            <SelectItem value="elite">Elite</SelectItem>
                            <SelectItem value="campaign">Campaign</SelectItem>
                            <SelectItem value="special">Special</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Description</label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="Describe this sprite"
                          className="bg-gray-700 border-gray-600"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Unlock Condition (Optional)</label>
                        <Input
                          value={formData.unlockCondition}
                          onChange={(e) => setFormData({...formData, unlockCondition: e.target.value})}
                          placeholder="e.g., 1000+ Faction XP"
                          className="bg-gray-700 border-gray-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">HTML Content</label>
                        <Textarea
                          value={formData.htmlContent}
                          onChange={(e) => {
                            setFormData({...formData, htmlContent: e.target.value});
                            setPreviewHtml(e.target.value);
                          }}
                          placeholder="Enter HTML sprite code"
                          className="bg-gray-700 border-gray-600 font-mono text-xs"
                          rows={8}
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Preview</label>
                        <div className="bg-gray-700 p-4 rounded flex justify-center items-center h-24 border">
                          {formData.htmlContent && (
                            <div dangerouslySetInnerHTML={{ __html: formData.htmlContent }} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save Sprite
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsCreating(false);
                        setEditingSprite(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">Select a sprite to edit or create a new one</p>
                <Button onClick={handleCreate} className="bg-yellow-600 hover:bg-yellow-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Sprite
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}