import { motion } from "framer-motion";
import { ArrowLeft, Globe, Map, Bell, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSettings, VoiceLanguage, MapStyle } from "@/contexts/SettingsContext";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const Settings = () => {
  const navigate = useNavigate();
  const { settings, updateVoiceLanguage, updateMapStyle, updateNotification } = useSettings();

  const languageOptions: { value: VoiceLanguage; label: string; flag: string }[] = [
    { value: "en", label: "English", flag: "🇬🇧" },
    { value: "sw", label: "Kiswahili", flag: "🇰🇪" },
  ];

  const mapStyleOptions: { value: MapStyle; label: string; icon: string }[] = [
    { value: "standard", label: "Standard", icon: "🗺️" },
    { value: "satellite", label: "Satellite", icon: "🛰️" },
    { value: "terrain", label: "Terrain", icon: "⛰️" },
  ];

  const notificationOptions: { key: keyof typeof settings.notifications; label: string; description: string }[] = [
    { key: "trafficAlerts", label: "Traffic Alerts", description: "Get notified about traffic jams ahead" },
    { key: "speedWarnings", label: "Speed Warnings", description: "Alert when exceeding speed limits" },
    { key: "routeUpdates", label: "Route Updates", description: "Notify when a faster route is found" },
    { key: "communityReports", label: "Community Reports", description: "See reports from other drivers" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border"
      >
        <div className="flex items-center gap-4 p-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <h1 className="font-display text-xl font-semibold text-foreground">Settings</h1>
        </div>
      </motion.header>

      <div className="p-4 space-y-6 max-w-lg mx-auto pb-8">
        {/* Voice Navigation Language */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="nav-card p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-info/20 flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-info" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Voice Language</h2>
              <p className="text-sm text-muted-foreground">Navigation voice prompts</p>
            </div>
          </div>

          <RadioGroup
            value={settings.voiceLanguage}
            onValueChange={(value) => updateVoiceLanguage(value as VoiceLanguage)}
            className="space-y-3"
          >
            {languageOptions.map((option) => (
              <motion.div
                key={option.value}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                  settings.voiceLanguage === option.value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-secondary/50 hover:bg-secondary"
                }`}
                onClick={() => updateVoiceLanguage(option.value)}
              >
                <span className="text-2xl">{option.flag}</span>
                <Label htmlFor={option.value} className="flex-1 cursor-pointer font-medium">
                  {option.label}
                </Label>
                <RadioGroupItem value={option.value} id={option.value} />
              </motion.div>
            ))}
          </RadioGroup>
        </motion.section>

        {/* Map Style */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="nav-card p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <Map className="w-5 h-5 text-success" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Map Style</h2>
              <p className="text-sm text-muted-foreground">Choose how the map looks</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {mapStyleOptions.map((option) => (
              <motion.button
                key={option.value}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateMapStyle(option.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  settings.mapStyle === option.value
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border bg-secondary/50 hover:bg-secondary"
                }`}
              >
                <span className="text-3xl">{option.icon}</span>
                <span className="text-sm font-medium text-foreground">{option.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Notifications */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="nav-card p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Notifications</h2>
              <p className="text-sm text-muted-foreground">Control what alerts you receive</p>
            </div>
          </div>

          <div className="space-y-4">
            {notificationOptions.map((option) => (
              <motion.div
                key={option.key}
                whileTap={{ scale: 0.99 }}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex-1">
                  <Label htmlFor={option.key} className="font-medium text-foreground cursor-pointer">
                    {option.label}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                </div>
                <Switch
                  id={option.key}
                  checked={settings.notifications[option.key]}
                  onCheckedChange={(checked) => updateNotification(option.key, checked)}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* App Info */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center pt-4"
        >
          <p className="text-sm text-muted-foreground">Wayfinder Kenya v1.0.0</p>
          <p className="text-xs text-muted-foreground mt-1">Made with ❤️ for Kenyan drivers</p>
        </motion.section>
      </div>
    </div>
  );
};

export default Settings;
