
export const successMessages = [
  "🎉 Fantastic work! You've crushed another Pomodoro!",
  "🌟 Excellent focus! Your productivity is on fire!",
  "🚀 Amazing! You're building great momentum!",
  "💪 Well done! Your discipline is paying off!",
  "🎯 Perfect! Another task conquered with focus!",
  "✨ Outstanding! You're unstoppable today!",
  "🏆 Brilliant work! Your dedication is inspiring!",
  "🌈 Superb focus! You're making real progress!",
  "⭐ Incredible! Your consistency is remarkable!",
  "🔥 Phenomenal! You're in the zone today!"
];

export const motivationalMessages = [
  "💪 Don't give up! Every expert was once a beginner!",
  "🌟 Progress, not perfection! Keep pushing forward!",
  "🚀 You're closer to your goal than you think!",
  "🎯 Focus is a superpower. You've got this!",
  "✨ Small steps lead to big achievements!",
  "🌈 Challenges make you stronger. Keep going!",
  "⭐ Your future self will thank you for not giving up!",
  "🔥 Turn obstacles into opportunities!",
  "💎 Pressure makes diamonds. Stay strong!",
  "🌱 Growth happens outside your comfort zone!",
  "🏔️ Every mountain is climbed one step at a time!",
  "⚡ Your potential is limitless. Believe in yourself!",
  "🎪 Make today count. You're capable of amazing things!",
  "🌊 Ride the waves of challenge with confidence!",
  "🦋 Transform your struggles into strength!"
];

export const getRandomSuccessMessage = (): string => {
  return successMessages[Math.floor(Math.random() * successMessages.length)];
};

export const getRandomMotivationalMessage = (): string => {
  return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
};
