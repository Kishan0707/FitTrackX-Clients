// Speech recognition for voice commands (experimental)
export const startVoiceRecognition = (onCommand, language = "en-US") => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.log("Speech recognition not supported");
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = language;

  recognition.onresult = (event) => {
    const last = event.results.length - 1;
    const transcript = event.results[last][0].transcript.trim().toLowerCase();
    console.log("Voice command:", transcript);
    if (onCommand) onCommand(transcript);
  };

  recognition.onerror = (event) => {
    console.log("Speech recognition error:", event.error);
  };

  recognition.start();
  return recognition;
};

export const stopVoiceRecognition = (recognition) => {
  if (recognition) {
    recognition.stop();
  }
};

// Predefined voice command matcher
export const matchVoiceCommand = (transcript) => {
  const commands = {
    "start workout": { action: "startWorkout", route: "/workouts" },
    "begin workout": { action: "startWorkout", route: "/workouts" },
    "log meal": { action: "logMeal", route: "/diet" },
    "add food": { action: "logMeal", route: "/diet" },
    "my progress": { action: "viewProgress", route: "/progress" },
    "check progress": { action: "viewProgress", route: "/progress" },
    "go home": { action: "navigate", route: "/dashboard" },
    "home": { action: "navigate", route: "/dashboard" },
    "open settings": { action: "navigate", route: "/settings" },
    "settings": { action: "navigate", route: "/settings" },
    "open notifications": { action: "navigate", route: "/notifications" },
    "notifications": { action: "navigate", route: "/notifications" },
  };

  for (const [phrase, command] of Object.entries(commands)) {
    if (transcript.includes(phrase)) {
      return command;
    }
  }

  return null;
};
