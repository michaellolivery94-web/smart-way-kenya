import { useState, useCallback, useRef, useEffect } from "react";

export interface NavigationInstruction {
  id: string;
  type: 'turn' | 'continue' | 'arrive' | 'depart' | 'roundabout' | 'merge' | 'fork' | 'exit';
  modifier?: 'left' | 'right' | 'straight' | 'slight left' | 'slight right' | 'sharp left' | 'sharp right' | 'uturn';
  text: string;
  distance: number; // meters
  duration: number; // seconds
  roadName?: string;
  landmark?: string;
  coordinates: [number, number];
  announced: boolean;
}

interface UseVoiceNavigationOptions {
  enabled?: boolean;
  language?: string;
  volume?: number;
  rate?: number;
  pitch?: number;
  announceDistance?: number; // meters before turn to announce
  reminderDistance?: number; // meters before turn for reminder
}

interface UseVoiceNavigationReturn {
  isEnabled: boolean;
  isSpeaking: boolean;
  currentInstruction: NavigationInstruction | null;
  upcomingInstructions: NavigationInstruction[];
  toggleVoice: () => void;
  setEnabled: (enabled: boolean) => void;
  setInstructions: (instructions: NavigationInstruction[]) => void;
  updateUserPosition: (lat: number, lng: number) => void;
  announceInstruction: (instruction: NavigationInstruction) => void;
  announceCustom: (text: string) => void;
  stopSpeaking: () => void;
  volume: number;
  setVolume: (volume: number) => void;
}

// Nairobi-specific landmarks for enhanced navigation
const NAIROBI_LANDMARKS: Record<string, string[]> = {
  'Ring Road Parklands': ['Next to Sarit Centre', 'Near Westgate Mall'],
  'Uhuru Highway': ['Towards Nyayo Stadium', 'Past Railway Station'],
  'Mombasa Road': ['JKIA direction', 'Near SGR terminus'],
  'Waiyaki Way': ['ABC Place side', 'Near Westlands roundabout'],
  'Kenyatta Avenue': ['City centre', 'Near KICC'],
  'Ngong Road': ['Towards Prestige Plaza', 'Junction Mall area'],
  'Thika Road': ['Garden City direction', 'Safari Park area'],
  'Langata Road': ['Wilson Airport side', 'Near Carnivore'],
};

// Convert OSRM maneuver to readable instruction
const getManeuverText = (
  type: string,
  modifier: string | undefined,
  roadName: string | undefined,
  distance: number
): string => {
  const distanceText = distance < 100 
    ? `in ${Math.round(distance)} meters` 
    : distance < 1000 
      ? `in ${Math.round(distance / 100) * 100} meters`
      : `in ${(distance / 1000).toFixed(1)} kilometers`;

  const roadText = roadName ? ` onto ${roadName}` : '';
  const landmarkHint = roadName && NAIROBI_LANDMARKS[roadName] 
    ? `, ${NAIROBI_LANDMARKS[roadName][0]}` 
    : '';

  switch (type) {
    case 'turn':
      return `${distanceText}, turn ${modifier || 'ahead'}${roadText}${landmarkHint}`;
    case 'continue':
      return `Continue straight${roadText} for ${distanceText.replace('in ', '')}`;
    case 'arrive':
      return modifier === 'left' 
        ? 'Your destination is on your left'
        : modifier === 'right'
          ? 'Your destination is on your right'
          : 'You have arrived at your destination';
    case 'depart':
      return `Head ${modifier || 'straight'}${roadText}`;
    case 'roundabout':
      return `${distanceText}, enter the roundabout and take the ${modifier || 'exit'}${roadText}`;
    case 'merge':
      return `${distanceText}, merge ${modifier || 'ahead'}${roadText}`;
    case 'fork':
      return `${distanceText}, take the ${modifier || 'fork'}${roadText}`;
    case 'exit':
      return `${distanceText}, take the exit${roadText}`;
    default:
      return `${distanceText}, continue ${modifier || 'ahead'}${roadText}`;
  }
};

// Calculate distance between two coordinates in meters
const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const useVoiceNavigation = ({
  enabled = true,
  language = 'en-US',
  volume: initialVolume = 1,
  rate = 0.95,
  pitch = 1,
  announceDistance = 200,
  reminderDistance = 50,
}: UseVoiceNavigationOptions = {}): UseVoiceNavigationReturn => {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(initialVolume);
  const [instructions, setInstructionsState] = useState<NavigationInstruction[]>([]);
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const userPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const announcedRef = useRef<Set<string>>(new Set());
  const reminderAnnouncedRef = useRef<Set<string>>(new Set());

  // Get the current and upcoming instructions
  const currentInstruction = instructions[currentInstructionIndex] || null;
  const upcomingInstructions = instructions.slice(currentInstructionIndex, currentInstructionIndex + 3);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Warm up speech synthesis
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Speak text using Web Speech API
  const speak = useCallback((text: string, priority: boolean = false) => {
    if (!isEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    // Cancel current speech if priority
    if (priority && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.volume = volume;
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural'))
    ) || voices.find(v => v.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isEnabled, language, volume, rate, pitch]);

  // Announce an instruction
  const announceInstruction = useCallback((instruction: NavigationInstruction) => {
    if (!isEnabled) return;
    speak(instruction.text, true);
  }, [isEnabled, speak]);

  // Announce custom text
  const announceCustom = useCallback((text: string) => {
    if (!isEnabled) return;
    speak(text, false);
  }, [isEnabled, speak]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Toggle voice navigation
  const toggleVoice = useCallback(() => {
    setIsEnabled(prev => {
      const newState = !prev;
      if (!newState) {
        stopSpeaking();
      } else {
        speak('Voice navigation enabled', false);
      }
      return newState;
    });
  }, [stopSpeaking, speak]);

  // Set instructions from OSRM route data
  const setInstructions = useCallback((newInstructions: NavigationInstruction[]) => {
    setInstructionsState(newInstructions);
    setCurrentInstructionIndex(0);
    announcedRef.current.clear();
    reminderAnnouncedRef.current.clear();
    
    // Announce first instruction
    if (newInstructions.length > 0 && isEnabled) {
      setTimeout(() => {
        speak(`Starting navigation. ${newInstructions[0].text}`, true);
      }, 500);
    }
  }, [isEnabled, speak]);

  // Update user position and check for announcements
  const updateUserPosition = useCallback((lat: number, lng: number) => {
    userPositionRef.current = { lat, lng };

    if (instructions.length === 0) return;

    // Find the nearest instruction that hasn't been passed
    for (let i = currentInstructionIndex; i < instructions.length; i++) {
      const instruction = instructions[i];
      const distance = calculateDistance(
        lat, lng,
        instruction.coordinates[0],
        instruction.coordinates[1]
      );

      // Check if we should announce upcoming turn
      if (distance <= announceDistance && distance > reminderDistance) {
        if (!announcedRef.current.has(instruction.id)) {
          announcedRef.current.add(instruction.id);
          announceInstruction(instruction);
        }
      }

      // Check if we should give a reminder
      if (distance <= reminderDistance && distance > 10) {
        if (!reminderAnnouncedRef.current.has(instruction.id)) {
          reminderAnnouncedRef.current.add(instruction.id);
          const reminderText = instruction.type === 'turn' 
            ? `Now, turn ${instruction.modifier || 'ahead'}`
            : instruction.type === 'arrive'
              ? 'Arriving at your destination'
              : `${instruction.text.split(',')[0]} now`;
          speak(reminderText, true);
        }
      }

      // Check if we've passed this instruction
      if (distance < 10) {
        if (i > currentInstructionIndex) {
          setCurrentInstructionIndex(i + 1);
          
          // Announce arrival
          if (instruction.type === 'arrive') {
            speak('You have arrived at your destination. Navigation ended.', true);
          }
        }
        break;
      }
    }
  }, [instructions, currentInstructionIndex, announceDistance, reminderDistance, announceInstruction, speak]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  return {
    isEnabled,
    isSpeaking,
    currentInstruction,
    upcomingInstructions,
    toggleVoice,
    setEnabled: setIsEnabled,
    setInstructions,
    updateUserPosition,
    announceInstruction,
    announceCustom,
    stopSpeaking,
    volume,
    setVolume,
  };
};

// Helper function to parse OSRM route steps into NavigationInstructions
export const parseOSRMSteps = (steps: any[]): NavigationInstruction[] => {
  return steps.map((step, index) => {
    const maneuver = step.maneuver;
    const type = maneuver.type as NavigationInstruction['type'];
    const modifier = maneuver.modifier as NavigationInstruction['modifier'];
    const roadName = step.name || step.ref;
    const distance = step.distance;
    const duration = step.duration;
    
    return {
      id: `step-${index}`,
      type,
      modifier,
      text: getManeuverText(type, modifier, roadName, distance),
      distance,
      duration,
      roadName,
      coordinates: [maneuver.location[1], maneuver.location[0]] as [number, number],
      announced: false,
    };
  });
};
