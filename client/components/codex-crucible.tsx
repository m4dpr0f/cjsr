import { useState, useEffect } from "react";
import { PixelButton } from "@/components/ui/pixel-button";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { ElementalEgg } from "@/components/ui/elemental-egg";

// Type for the shrine offering
interface ShrineOffering {
  source: string;
  type: string;
  timestamp: string;
}

// Type for a generated egg
interface GaruEgg {
  id: number;
  name: string;
  type: string;
  elemental_affinity: string;
  color: string;
  petal_id: string;
  hatched: boolean;
  timestamp: string;
  user_id: number;
}

// Type for a TEK8 petal
interface TEK8Petal {
  petal: string;
  element: string;
  eggType: string;
}

export function CodexCrucible() {
  const [offeringSource, setOfferingSource] = useState("");
  const [offeringType, setOfferingType] = useState("personal");
  const [selectedPetal, setSelectedPetal] = useState("");
  const [petals, setPetals] = useState<TEK8Petal[]>([]);
  const [recentOfferings, setRecentOfferings] = useState<ShrineOffering[]>([]);
  const [generatedEggs, setGeneratedEggs] = useState<GaruEgg[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'offer' | 'eggs' | 'about'>('offer');
  
  // Load petals and eggs on mount
  useEffect(() => {
    fetchPetals();
    fetchGeneratedEggs();
  }, []);
  
  // Fetch elemental petals
  const fetchPetals = async () => {
    try {
      const response = await apiRequest('GET', '/api/tek8/petals');
      const data = await response.json();
      setPetals(data.petals || []);
    } catch (error) {
      console.error("Failed to fetch elemental petals:", error);
    }
  };
  
  const fetchGeneratedEggs = async () => {
    try {
      const response = await apiRequest('GET', '/api/shrine/eggs');
      const data = await response.json();
      setGeneratedEggs(data.eggs || []);
    } catch (error) {
      console.error("Failed to fetch eggs:", error);
    }
  };
  
  const handleSubmitOffering = async () => {
    if (!selectedPetal) {
      alert("Please select an elemental petal first");
      return;
    }
    
    if (!offeringSource || offeringSource.trim() === "") {
      alert("Please enter some text for egg name generation");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get user profile to check if user is logged in
      const profileResponse = await apiRequest('GET', '/api/profile');
      
      if (profileResponse.status !== 200) {
        alert("You must be logged in to claim an egg. Please log in and try again.");
        setIsSubmitting(false);
        return;
      }
      
      // Check if user has already claimed an egg today
      const eggsResponse = await apiRequest('GET', '/api/shrine/eggs');
      const eggsData = await eggsResponse.json();
      const today = new Date().toISOString().split('T')[0];
      
      const hasClaimedToday = eggsData.eggs?.some((egg: any) => {
        const eggDate = new Date(egg.timestamp).toISOString().split('T')[0];
        return eggDate === today;
      });
      
      if (hasClaimedToday) {
        alert("You have already claimed an egg today. Please return tomorrow for another egg.");
        setIsSubmitting(false);
        return;
      }
      
      // Submit the offering with the custom text
      const response = await apiRequest('POST', '/api/shrine/submissions', {
        petalId: selectedPetal,
        source: offeringSource,
        type: "custom_text"
      });
      
      const data = await response.json();
      
      if (data.success && data.egg) {
        // Add the new egg to our list immediately
        setGeneratedEggs(prev => [data.egg, ...prev]);
        
        // Reset form and switch to eggs tab
        setSelectedPetal("");
        setOfferingSource("");
        setActiveTab('eggs');
        
        // Show successful submission feedback
        alert("Your egg has been created! Check 'YOUR EGGS' to see your new Garu egg.");
      } else {
        // Show error message from server
        alert(data.error || "Failed to create egg. Please try again.");
      }
    } catch (error) {
      console.error("Failed to submit petal selection:", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get petal display color
  const getPetalColor = (element: string): string => {
    switch (element.toLowerCase()) {
      case 'fire': return "bg-red-500";
      case 'earth': return "bg-green-600";
      case 'air': return "bg-white";  // Changed to white
      case 'chaos': return "bg-purple-700";
      case 'ether': return "bg-black"; // Changed to black
      case 'water': return "bg-blue-600";
      case 'coin': return "bg-gray-400"; // Changed to silver/gray for Coin Element
      case 'order': return "bg-amber-500"; // Changed to saffron/amber
      default: return "bg-gray-500";
    }
  };
  
  // Helper function to get egg color based on type
  const getEggColor = (type: string): string => {
    switch (type) {
      case "EtherGaru": return "bg-black"; // Changed to black
      case "AirGaru": return "bg-white"; // Changed to white
      case "FireGaru": return "bg-red-500";
      case "WaterGaru": return "bg-blue-700";
      case "EarthGaru": return "bg-green-600";
      case "ChaosGaru": return "bg-black";
      case "OrderGaru": return "bg-amber-500"; // Changed to saffron/amber
      case "WealthGaru": return "bg-gray-400"; // Changed to silver for Coin/Silver element
      default: return "bg-purple-400";
    }
  };
  
  return (
    <div className="bg-dark minecraft-border p-4">
      <h2 className="font-minecraft text-2xl text-primary mb-4 text-center">EGG SHRINE</h2>
      
      <div className="bg-yellow-800/50 border border-yellow-600 p-3 mb-4 rounded">
        <p className="text-white font-bold mb-1">✨ TEXT TO EGG</p>
        <p className="text-yellow-200 text-sm">
          Submit text to create unique elemental eggs based on your choice.
          Each egg type corresponds to one of the eight elemental petals.
        </p>
      </div>
      
      <div className="flex border-b border-primary/50 mb-4">
        <button
          className={`px-4 py-2 font-minecraft text-sm ${activeTab === 'offer' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}
          onClick={() => setActiveTab('offer')}
        >
          MAKE OFFERING
        </button>
        <button
          className={`px-4 py-2 font-minecraft text-sm ${activeTab === 'eggs' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}
          onClick={() => setActiveTab('eggs')}
        >
          YOUR EGGS
        </button>
        <button
          className={`px-4 py-2 font-minecraft text-sm ${activeTab === 'about' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}
          onClick={() => setActiveTab('about')}
        >
          ABOUT GARU
        </button>
      </div>
      
      {activeTab === 'offer' && (
        <div>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Teacher Guru sprite */}
            <div className="w-full md:w-1/3">
              <Card className="bg-dark/50 h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                  <ChickenAvatar
                    chickenType="html_teacherGuru"
                    jockeyType="html_teacherGuru"
                    size="lg"
                    showName={true}
                  />
                  <p className="text-center text-sm text-gray-300 mt-4">
                    "Choose one of the eight elemental petals to receive a Garu egg. Each petal represents a different element that will determine your egg's properties."
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Offering form */}
            <div className="w-full md:w-2/3">
              <Card className="bg-dark/50">
                <CardContent className="p-4">
                  <div className="mb-4">
                    <Label htmlFor="offering-source">Your Custom Text</Label>
                    <Input
                      id="offering-source"
                      value={offeringSource}
                      onChange={(e) => setOfferingSource(e.target.value)}
                      placeholder="Enter words for egg name generation..."
                      className="bg-black/70 border-primary"
                    />
                    <p className="text-xs text-gray-300 mt-1">
                      Your words will be combined with your selected element to create a unique egg name.
                    </p>
                  </div>
                  
                  <div className="mb-4 bg-yellow-800/30 p-3 rounded border border-yellow-600/50">
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-400 mr-2">⏱️</span>
                      <Label className="font-bold text-yellow-100">Daily Egg Limit</Label>
                    </div>
                    <p className="text-xs text-yellow-200">
                      The Egg Shrine allows one egg claim per day. Choose your element and words wisely!
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <Label htmlFor="offering-petal" className="mb-2 block">Select an Elemental Petal</Label>
                    <p className="text-xs text-gray-300 mb-4">
                      Choose one of the eight elemental petals to receive a corresponding Garu egg.
                      <span className="block mt-1 text-yellow-300">You can only make one selection per day.</span>
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {petals.map((petal) => (
                        <div 
                          key={petal.petal}
                          className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                            selectedPetal === petal.petal 
                            ? 'border-primary bg-dark/70' 
                            : 'border-gray-700 hover:border-gray-500'
                          }`}
                          onClick={() => setSelectedPetal(petal.petal)}
                        >
                          <div className="flex items-center mb-2">
                            <div className={`w-6 h-6 rounded-full ${getPetalColor(petal.element)} mr-2 flex items-center justify-center`}>
                              <span className="text-sm">🥚</span>
                            </div>
                            <div className="font-minecraft text-sm">{petal.petal}</div>
                          </div>
                          <div className="text-xs text-primary mb-1">{petal.element} Element</div>
                          <div className="text-xs text-gray-300">{petal.eggType} egg</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <PixelButton
                      onClick={handleSubmitOffering}
                      disabled={isSubmitting || !selectedPetal}
                    >
                      {isSubmitting ? "Generating Egg..." : "Claim Egg for Selected Petal"}
                    </PixelButton>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Egg creation tips */}
          <div className="mt-8">
            <h3 className="font-minecraft text-lg text-primary mb-4">EGG CREATION TIPS</h3>
            
            <Card className="bg-dark/50">
              <CardContent className="p-4">
                <div className="text-gray-300 space-y-2">
                  <p>• Each egg type has unique characteristics and elemental affinities</p>
                  <p>• Your input text is incorporated into your egg's unique name</p>
                  <p>• The D2 petal creates silver eggs with metallic properties</p>
                  <p>• The D100 petal creates goldstone eggs with geometric patterns</p>
                  <p>• Each elemental egg displays a unique pattern and color matching its element</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {activeTab === 'eggs' && (
        <div>
          <h3 className="font-minecraft text-lg text-primary mb-4">YOUR GARU EGGS</h3>
          
          {generatedEggs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedEggs.map((egg, index) => (
                <Card key={index} className="bg-dark/50">
                  <CardContent className="p-4 flex items-center">
                    <ElementalEgg 
                      type={egg.type} 
                      size="md" 
                      hatched={egg.hatched} 
                      className="mr-4" 
                    />
                    <div>
                      <h4 className="font-minecraft text-primary">{egg.name}</h4>
                      <p className="text-sm text-gray-300">
                        {egg.type === 'Silver' ? 'silver egg' : 
                         egg.type === 'Goldstone' ? 'goldstone egg' : 
                         egg.type.replace('Garu', '').toLowerCase() + ' egg'}
                      </p>
                      <p className="text-xs text-gray-400">Elemental Affinity: {egg.elemental_affinity}</p>
                      <p className="text-xs text-gray-400">{new Date(egg.timestamp).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center">No eggs generated yet. Make an offering to receive your first egg!</p>
          )}
        </div>
      )}
      
      {activeTab === 'about' && (
        <div>
          <h3 className="font-minecraft text-lg text-primary mb-4">THE GARU ELEMENTAL GENEALOGY</h3>
          
          <p className="text-gray-300 mb-6">
            Each Garu type corresponds to one of the eight elemental petals, with unique characteristics, 
            colorations, and symbolic affinities that define not only appearance but also abilities and tendencies.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-dark/50">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 mr-2"></div>
                  <h4 className="font-minecraft text-primary">D12 Ether — The Radiant Sky Garu</h4>
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>Element: Ether</li>
                  <li>Core Color: Iridescent white</li>
                  <li>Feather Accent: Indigo, Silver</li>
                  <li>Egg Type: Clouded or Soundstone Egg</li>
                  <li>Flight Type: Song-boosted levitation</li>
                  <li>Legendary Variant: Auralum</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-dark/50">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-sky-300 mr-2"></div>
                  <h4 className="font-minecraft text-primary">D8 Air — The Zephyr Garu</h4>
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>Element: Air</li>
                  <li>Core Color: Sky blue / Soft cyan</li>
                  <li>Feather Accent: Pale gold, white</li>
                  <li>Egg Type: Wind-borne Spiral Egg</li>
                  <li>Flight Type: Gust leaps, high jumps</li>
                  <li>Legendary Variant: Caelora</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-dark/50">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-red-500 mr-2"></div>
                  <h4 className="font-minecraft text-primary">D4 Fire — The Ember Garu</h4>
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>Element: Fire</li>
                  <li>Core Color: Crimson / Orange flame</li>
                  <li>Feather Accent: Yellow, orange</li>
                  <li>Egg Type: Warmstone or Flame Egg</li>
                  <li>Flight Type: Heat thermals, quick bursts</li>
                  <li>Legendary Variant: Phoenixian</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-dark/50">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-700 mr-2"></div>
                  <h4 className="font-minecraft text-primary">D20 Water — The Tide Garu</h4>
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>Element: Water</li>
                  <li>Core Color: Deep blue / Aquamarine</li>
                  <li>Feather Accent: Teal, azure</li>
                  <li>Egg Type: Ebb-Flow or Seafoam Egg</li>
                  <li>Flight Type: Wave gliding, deep dives</li>
                  <li>Legendary Variant: Maridin</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-dark/50">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-green-600 mr-2"></div>
                  <h4 className="font-minecraft text-primary">D6 Earth — The Terra Garu</h4>
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>Element: Earth</li>
                  <li>Core Color: Forest green / Moss</li>
                  <li>Feather Accent: Brown, amber</li>
                  <li>Egg Type: Terraverde or Root Egg</li>
                  <li>Flight Type: Strong hops, burrow emergence</li>
                  <li>Legendary Variant: Geomara</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-dark/50">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-purple-700 mr-2"></div>
                  <h4 className="font-minecraft text-primary">D10 Chaos — The Trickster Garu</h4>
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>Element: Chaos</li>
                  <li>Core Color: Purple / Shifting hues</li>
                  <li>Feather Accent: Random patterns, multiple colors</li>
                  <li>Egg Type: Voidmyst or Shifter Egg</li>
                  <li>Flight Type: Unpredictable, teleport-like</li>
                  <li>Legendary Variant: Discordia</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-dark/50">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-gray-300 mr-2"></div>
                  <h4 className="font-minecraft text-primary">D100 Order — The Sentinel Garu</h4>
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>Element: Order</li>
                  <li>Core Color: Silver / White</li>
                  <li>Feather Accent: Symmetrical patterns, gray</li>
                  <li>Egg Type: Stonehide or Geometric Egg</li>
                  <li>Flight Type: Precise, calculated movements</li>
                  <li>Legendary Variant: Harmonia</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-dark/50">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-yellow-400 mr-2"></div>
                  <h4 className="font-minecraft text-primary">D2 Coin — The Fortune Garu</h4>
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>Element: Coin/Wealth</li>
                  <li>Core Color: Gold / Yellow</li>
                  <li>Feather Accent: Bronze, amber</li>
                  <li>Egg Type: Sunglow or Prosperity Egg</li>
                  <li>Flight Type: Shimmering, luck-enhanced jumps</li>
                  <li>Legendary Variant: Plutora</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}