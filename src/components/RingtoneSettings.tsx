
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Play, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface RingtoneSettingsProps {
  currentRingtone: string | null;
  onRingtoneChange: (ringtone: string | null) => void;
}

const RingtoneSettings = ({ currentRingtone, onRingtoneChange }: RingtoneSettingsProps) => {
  const [customUrl, setCustomUrl] = useState('');

  const defaultRingtones = [
    { name: 'Bell', url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+f5v2YdBjuS1e/PfC0FJI' },
    { name: 'Chime', url: 'data:audio/wav;base64,UklGRuQEAABXQVZFZm10IBAAAAABAAEAgIQAAIhYAQACABAAZGF0YcAEAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+f5v2YdBjuS1e/PfC0FJI' },
    { name: 'Beep', url: 'data:audio/wav;base64,UklGRv4CAABXQVZFZm10IBAAAAABAAEAgIQAAIhYAQACABAAZGF0YdoCAAC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4' }
  ];

  const playTestSound = (url: string) => {
    try {
      const audio = new Audio(url);
      audio.volume = 0.5;
      audio.play().catch(() => {
        toast({
          title: "Error",
          description: "Could not play this sound",
          variant: "destructive"
        });
      });
    } catch {
      toast({
        title: "Error",
        description: "Invalid audio URL",
        variant: "destructive"
      });
    }
  };

  const handleCustomUrlSubmit = () => {
    if (customUrl.trim()) {
      onRingtoneChange(customUrl.trim());
      toast({
        title: "Custom Ringtone Set",
        description: "Your custom ringtone has been saved"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Default Ringtones</h3>
        <div className="space-y-3">
          {defaultRingtones.map((ringtone) => (
            <Card key={ringtone.name} className="p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{ringtone.name}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => playTestSound(ringtone.url)}
                  >
                    <Play size={14} className="mr-1" />
                    Test
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onRingtoneChange(ringtone.url)}
                    variant={currentRingtone === ringtone.url ? "default" : "outline"}
                  >
                    {currentRingtone === ringtone.url ? "Selected" : "Select"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Custom Ringtone</h3>
        <Card className="p-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="custom-url">Audio URL</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="custom-url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://example.com/sound.mp3"
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => customUrl && playTestSound(customUrl)}
                  disabled={!customUrl.trim()}
                >
                  <Play size={14} />
                </Button>
              </div>
            </div>
            <Button
              onClick={handleCustomUrlSubmit}
              disabled={!customUrl.trim()}
              className="w-full"
            >
              <Upload size={14} className="mr-2" />
              Set Custom Ringtone
            </Button>
          </div>
        </Card>
      </div>

      <div>
        <Card className="p-4">
          <Button
            variant="outline"
            onClick={() => onRingtoneChange(null)}
            className="w-full"
          >
            Use Default System Sound
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default RingtoneSettings;
