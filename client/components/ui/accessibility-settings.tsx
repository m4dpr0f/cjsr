import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings } from "lucide-react";

// Default settings values
const DEFAULT_SETTINGS = {
  fontSize: 100, // percentage of base font size
  highContrast: false,
  reducedMotion: false,
  enabled: false,
};

// Type for our accessibility settings
interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
}

export function AccessibilitySettings() {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [isOpen, setIsOpen] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("chickenJockeyAccessibility");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Apply settings whenever they change
  useEffect(() => {
    // Apply font size
    document.documentElement.style.setProperty("--font-size-multiplier", `${settings.fontSize / 100}`);
    
    // Apply high contrast
    if (settings.highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
    
    // Apply reduced motion
    if (settings.reducedMotion) {
      document.documentElement.classList.add("reduced-motion");
    } else {
      document.documentElement.classList.remove("reduced-motion");
    }
    
    // Save to localStorage
    localStorage.setItem("chickenJockeyAccessibility", JSON.stringify(settings));
  }, [settings]);

  // Handle font size change
  const handleFontSizeChange = (value: number[]) => {
    setSettings({ ...settings, fontSize: value[0] });
  };

  // Handle high contrast toggle
  const handleHighContrastChange = (checked: boolean) => {
    setSettings({ ...settings, highContrast: checked });
  };

  // Handle reduced motion toggle
  const handleReducedMotionChange = (checked: boolean) => {
    setSettings({ ...settings, reducedMotion: checked });
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="p-1 h-8 w-8" title="Accessibility Settings">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Accessibility Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-primary font-pixel">Accessibility Settings</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Text Size</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs">A</span>
              <Slider
                value={[settings.fontSize]}
                min={75}
                max={150}
                step={5}
                onValueChange={handleFontSizeChange}
                className="mx-2"
              />
              <span className="text-base">A</span>
            </div>
            <p className="text-sm text-gray-400">{settings.fontSize}% of default size</p>
          </div>

          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="high-contrast" className="font-medium">High Contrast</Label>
                <p className="text-xs text-gray-400">Increase color contrast for better readability</p>
              </div>
              <Switch
                id="high-contrast"
                checked={settings.highContrast}
                onCheckedChange={handleHighContrastChange}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reduced-motion" className="font-medium">Reduced Motion</Label>
                <p className="text-xs text-gray-400">Minimize animations and motion effects</p>
              </div>
              <Switch
                id="reduced-motion"
                checked={settings.reducedMotion}
                onCheckedChange={handleReducedMotionChange}
              />
            </div>
          </div>

          <Separator />
          
          <div className="flex justify-center">
            <Button variant="outline" onClick={resetToDefaults}>Reset to Defaults</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}