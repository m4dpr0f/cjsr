import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Smartphone, Monitor, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const IslamicInputGuide: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const copySymbol = (symbol: string, name: string) => {
    navigator.clipboard.writeText(symbol);
    toast({
      title: "Copied!",
      description: `${name} copied to clipboard`,
      duration: 2000,
    });
  };

  const islamicSymbols = [
    { symbol: 'ﷺ', name: 'Peace be upon him (PBUH)', unicode: 'U+FDFA' },
    { symbol: 'ﷻ', name: 'Jalla Jalaluhu', unicode: 'U+FDFB' },
    { symbol: 'ﷲ', name: 'Allah', unicode: 'U+FDF2' },
    { symbol: 'ﷴ', name: 'Muhammad', unicode: 'U+FDF4' },
    { symbol: '﷽', name: 'Bismillah', unicode: 'U+FDFD' }
  ];

  if (!isOpen) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className={`${className} text-amber-200 border-amber-200/30 hover:bg-amber-200/10`}
      >
        <Info className="w-4 h-4 mr-2" />
        Islamic Symbols Guide
      </Button>
    );
  }

  return (
    <Card className="bg-gray-800 border-amber-200/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg text-amber-200">Islamic Symbols Input Guide</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>✕</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Quick Copy Section */}
        <div className="space-y-3">
          <h3 className="text-md font-semibold text-amber-100">Quick Copy Symbols</h3>
          <div className="grid grid-cols-1 gap-2">
            {islamicSymbols.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl text-amber-200">{item.symbol}</span>
                  <div>
                    <p className="text-sm text-white">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.unicode}</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copySymbol(item.symbol, item.name)}
                  className="text-amber-200 border-amber-200/30 hover:bg-amber-200/10"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Tabs defaultValue="mobile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mobile" className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4" />
              <span>Mobile</span>
            </TabsTrigger>
            <TabsTrigger value="desktop" className="flex items-center space-x-2">
              <Monitor className="w-4 h-4" />
              <span>Desktop</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mobile" className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-md font-semibold text-amber-100">Mobile Device Instructions</h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-gray-700 rounded">
                  <Badge className="mb-2 bg-green-600">iOS (iPhone/iPad)</Badge>
                  <ol className="text-sm text-gray-200 space-y-1 list-decimal list-inside">
                    <li>Settings → General → Keyboard → Text Replacement</li>
                    <li>Tap "+" to add new shortcut</li>
                    <li>Phrase: ﷺ | Shortcut: pbuh</li>
                    <li>Or use Arabic keyboard: Settings → General → Keyboard → Keyboards → Add Arabic</li>
                  </ol>
                </div>

                <div className="p-3 bg-gray-700 rounded">
                  <Badge className="mb-2 bg-blue-600">Android</Badge>
                  <ol className="text-sm text-gray-200 space-y-1 list-decimal list-inside">
                    <li>Settings → System → Languages & Input → Virtual Keyboard</li>
                    <li>Select your keyboard → Text Correction → Personal Dictionary</li>
                    <li>Add: ﷺ with shortcut "pbuh"</li>
                    <li>Or install Arabic keyboard from Play Store</li>
                  </ol>
                </div>

                <div className="p-3 bg-gray-700 rounded">
                  <Badge className="mb-2 bg-purple-600">Quick Method</Badge>
                  <p className="text-sm text-gray-200">
                    Long-press on any text field and select "Paste" after copying symbols from above.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="desktop" className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-md font-semibold text-amber-100">Desktop Instructions</h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-gray-700 rounded">
                  <Badge className="mb-2 bg-blue-600">Windows</Badge>
                  <ol className="text-sm text-gray-200 space-y-1 list-decimal list-inside">
                    <li>Windows Key + H for voice typing, say "peace be upon him symbol"</li>
                    <li>Or Windows Key + ; for emoji panel (search "Islamic")</li>
                    <li>Character Map: Start → Character Map → Select Arabic symbols</li>
                    <li>Alt codes: Hold Alt + type Unicode (requires Arabic font)</li>
                  </ol>
                </div>

                <div className="p-3 bg-gray-700 rounded">
                  <Badge className="mb-2 bg-gray-600">macOS</Badge>
                  <ol className="text-sm text-gray-200 space-y-1 list-decimal list-inside">
                    <li>Ctrl + Cmd + Space for Character Viewer</li>
                    <li>Search "Arabic" or "Islamic"</li>
                    <li>System Preferences → Keyboard → Text → Add replacement</li>
                    <li>Option + various keys for special characters</li>
                  </ol>
                </div>

                <div className="p-3 bg-gray-700 rounded">
                  <Badge className="mb-2 bg-orange-600">Linux</Badge>
                  <ol className="text-sm text-gray-200 space-y-1 list-decimal list-inside">
                    <li>Ctrl + Shift + U, then Unicode (FDFA for ﷺ)</li>
                    <li>Install Arabic keyboard layout</li>
                    <li>Use Character Map application</li>
                    <li>Configure compose key for custom shortcuts</li>
                  </ol>
                </div>

                <div className="p-3 bg-gray-700 rounded">
                  <Badge className="mb-2 bg-purple-600">Browser Method</Badge>
                  <p className="text-sm text-gray-200">
                    Copy symbols from this guide and paste directly. Most browsers support Arabic Unicode.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="p-3 bg-amber-900/20 border border-amber-200/30 rounded">
          <p className="text-sm text-amber-100">
            <strong>Note:</strong> When typing Islamic content, always show proper reverence. 
            The symbol ﷺ should follow mentions of Prophet Muhammad to show respect and honor.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default IslamicInputGuide;