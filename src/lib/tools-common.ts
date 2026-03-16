// Shared utilities for all learning tools
// Ported from vanilla JS tools-common.js — same localStorage keys for backward compatibility

const STORAGE_PREFIX = "hala_tools_";

export function saveProgress(toolName: string, data: unknown): void {
  const key = STORAGE_PREFIX + toolName;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Storage might be full or disabled
  }
}

export function loadProgress<T = unknown>(toolName: string): T | null {
  const key = STORAGE_PREFIX + toolName;
  try {
    const data = localStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch {
    return null;
  }
}

export function clearProgress(toolName: string): void {
  const key = STORAGE_PREFIX + toolName;
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage might be disabled
  }
}

// Encouraging messages
const encouragingMessages = {
  correct: [
    "Great job!",
    "You got it!",
    "Excellent!",
    "Perfect!",
    "Amazing!",
    "Wonderful!",
    "Keep it up!",
    "Brilliant!",
  ],
  incorrect: [
    "Almost there! Try again!",
    "Keep trying! You can do it!",
    "Don't give up!",
    "Let's try once more!",
    "You're learning! Keep going!",
  ],
  streak: [
    "On fire!",
    "Unstoppable!",
    "Amazing streak!",
    "You're a star!",
    "Incredible!",
  ],
};

export function getEncouragement(
  type: "correct" | "incorrect",
  streak: number = 0
): string {
  let messages: string[];
  if (streak >= 5 && type === "correct") {
    messages = encouragingMessages.streak;
  } else {
    messages = encouragingMessages[type] || encouragingMessages.correct;
  }
  return messages[Math.floor(Math.random() * messages.length)];
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// Fisher-Yates shuffle
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = array.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate multiple choice options with plausible distractors
export function generateOptions(
  correctAnswer: number,
  min: number = 0,
  max: number = 144,
  count: number = 4
): number[] {
  const availableRange = max - min + 1;
  const adjustedCount = Math.min(count, availableRange);
  const options = [correctAnswer];
  const maxAttempts = adjustedCount * 20;
  let attempts = 0;

  while (options.length < adjustedCount && attempts < maxAttempts) {
    attempts++;
    let wrongAnswer: number;
    const strategy = Math.random();

    if (strategy < 0.3) {
      const offset =
        (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
      wrongAnswer = correctAnswer + offset;
    } else if (strategy < 0.6) {
      wrongAnswer = correctAnswer + (Math.random() > 0.5 ? 10 : -10);
    } else {
      wrongAnswer = Math.floor(Math.random() * (max - min + 1)) + min;
    }

    if (wrongAnswer >= min && wrongAnswer <= max && !options.includes(wrongAnswer)) {
      options.push(wrongAnswer);
    }
  }

  return shuffleArray(options);
}

export interface HistoryEntry {
  correct: boolean;
  timestamp: number;
}

export type MasteryLevel = "not-practiced" | "learning" | "mastered";

export function calculateMastery(history: HistoryEntry[]): MasteryLevel {
  if (!history || history.length === 0) return "not-practiced";

  const recent = history.slice(-5);
  const correctCount = recent.filter((item) => item.correct).length;
  const accuracy = correctCount / recent.length;

  if (recent.length >= 3 && accuracy >= 0.8) return "mastered";
  if (recent.length >= 1 && accuracy > 0) return "learning";
  return "not-practiced";
}
