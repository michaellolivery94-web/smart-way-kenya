import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type VoiceLanguage = "en" | "sw";
export type MapStyle = "standard" | "satellite" | "terrain";

interface NotificationPreferences {
  trafficAlerts: boolean;
  speedWarnings: boolean;
  routeUpdates: boolean;
  communityReports: boolean;
}

interface Settings {
  voiceLanguage: VoiceLanguage;
  mapStyle: MapStyle;
  notifications: NotificationPreferences;
}

interface SettingsContextType {
  settings: Settings;
  updateVoiceLanguage: (lang: VoiceLanguage) => void;
  updateMapStyle: (style: MapStyle) => void;
  updateNotification: (key: keyof NotificationPreferences, value: boolean) => void;
}

const defaultSettings: Settings = {
  voiceLanguage: "en",
  mapStyle: "standard",
  notifications: {
    trafficAlerts: true,
    speedWarnings: true,
    routeUpdates: true,
    communityReports: false,
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = "wayfinder-settings";

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn("Failed to save settings:", e);
    }
  }, [settings]);

  const updateVoiceLanguage = (lang: VoiceLanguage) => {
    setSettings((prev) => ({ ...prev, voiceLanguage: lang }));
  };

  const updateMapStyle = (style: MapStyle) => {
    setSettings((prev) => ({ ...prev, mapStyle: style }));
  };

  const updateNotification = (key: keyof NotificationPreferences, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
  };

  return (
    <SettingsContext.Provider
      value={{ settings, updateVoiceLanguage, updateMapStyle, updateNotification }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
