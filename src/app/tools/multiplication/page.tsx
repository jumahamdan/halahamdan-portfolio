"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ArrowLeft,
  Trophy,
  Flame,
  Zap,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Timer,
} from "lucide-react";
import {
  saveProgress,
  loadProgress,
  clearProgress,
  getEncouragement,
  formatTime,
  generateOptions,
  calculateMastery,
  type HistoryEntry,
  type MasteryLevel,
} from "@/lib/tools-common";

/* ================================================================
   Types
   ================================================================ */

interface FactData {
  history: HistoryEntry[];
  lastPracticed: number | null;
}

interface SavedData {
  facts: Record<string, FactData>;
  badges: string[];
  bestStreak: number;
  dailyStreak: number;
  lastPracticeDate: string | null;
}

interface SpeedResult {
  question: string;
  correct: boolean;
}

interface QuestionInfo {
  a: number;
  b: number;
  key: string;
}

type Mode = "learn" | "quiz" | "speed";

/* ================================================================
   Badge definitions (all 18)
   ================================================================ */

const BADGES: Record<string, { name: string; icon: string; desc: string }> = {
  first_correct: { name: "First Steps", icon: "\u{1F31F}", desc: "Answer your first question correctly" },
  streak_5: { name: "On Fire", icon: "\u{1F525}", desc: "Get 5 correct in a row" },
  streak_10: { name: "Unstoppable", icon: "\u26A1", desc: "Get 10 correct in a row" },
  streak_20: { name: "Legend", icon: "\u{1F451}", desc: "Get 20 correct in a row" },
  master_zeros: { name: "Zero Hero", icon: "0\uFE0F\u20E3", desc: "Master all \u00D70 facts" },
  master_ones: { name: "One Wonder", icon: "1\uFE0F\u20E3", desc: "Master all \u00D71 facts" },
  master_twos: { name: "Double Trouble", icon: "2\uFE0F\u20E3", desc: "Master all \u00D72 facts" },
  master_fives: { name: "High Five", icon: "\u{1F590}\uFE0F", desc: "Master all \u00D75 facts" },
  master_tens: { name: "Perfect Ten", icon: "\u{1F51F}", desc: "Master all \u00D710 facts" },
  master_squares: { name: "Square Master", icon: "\u2B1C", desc: "Master all square numbers" },
  facts_25: { name: "Quarter Way", icon: "\u{1F4CA}", desc: "Master 25 facts" },
  facts_50: { name: "Halfway There", icon: "\u{1F3C3}", desc: "Master 50 facts" },
  facts_100: { name: "Century Club", icon: "\u{1F4AF}", desc: "Master 100 facts" },
  facts_169: { name: "Multiplication Master", icon: "\u{1F3C6}", desc: "Master all 169 facts" },
  speed_10: { name: "Quick Thinker", icon: "\u23F1\uFE0F", desc: "Score 10+ in Speed Challenge" },
  speed_20: { name: "Speed Demon", icon: "\u{1F680}", desc: "Score 20+ in Speed Challenge" },
  daily_3: { name: "Dedicated", icon: "\u{1F4C5}", desc: "Practice 3 days in a row" },
  daily_7: { name: "Weekly Warrior", icon: "\u{1F5D3}\uFE0F", desc: "Practice 7 days in a row" },
};

const MAX_NUMBER = 12;

/* ================================================================
   Helper: initialize all facts
   ================================================================ */

function initFacts(existing: Record<string, FactData>): Record<string, FactData> {
  const facts = { ...existing };
  for (let i = 0; i <= MAX_NUMBER; i++) {
    for (let j = 0; j <= MAX_NUMBER; j++) {
      const key = `${i}x${j}`;
      if (!facts[key]) {
        facts[key] = { history: [], lastPracticed: null };
      }
    }
  }
  return facts;
}

/* ================================================================
   Main component
   ================================================================ */

export default function MultiplicationPage() {
  /* ---- persisted state ---- */
  const [progress, setProgress] = useState<Record<string, FactData>>({});
  const [badges, setBadges] = useState<string[]>([]);
  const [bestStreak, setBestStreak] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [lastPracticeDate, setLastPracticeDate] = useState<string | null>(null);

  /* ---- session state ---- */
  const [mode, setMode] = useState<Mode>("learn");
  const [filter, setFilter] = useState<string>("all");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionInfo | null>(null);
  const [quizOptions, setQuizOptions] = useState<number[]>([]);
  const [answered, setAnswered] = useState(false);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  /* ---- learn mode ---- */
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  /* ---- speed challenge ---- */
  const [speedRunning, setSpeedRunning] = useState(false);
  const [speedFinished, setSpeedFinished] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [speedInput, setSpeedInput] = useState("");
  const [speedResults, setSpeedResults] = useState<SpeedResult[]>([]);
  const [speedFlash, setSpeedFlash] = useState<"correct" | "incorrect" | null>(null);

  /* ---- badge notification ---- */
  const [badgeNotification, setBadgeNotification] = useState<string | null>(null);

  /* ---- celebration ---- */
  const [celebration, setCelebration] = useState<string | null>(null);

  /* ---- refs for mutable values in intervals/timeouts ---- */
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recentFactsRef = useRef<string[]>([]);
  const progressRef = useRef(progress);
  const badgesRef = useRef(badges);
  const bestStreakRef = useRef(bestStreak);
  const dailyStreakRef = useRef(dailyStreak);
  const lastPracticeDateRef = useRef(lastPracticeDate);
  const streakRef = useRef(streak);
  const scoreRef = useRef(score);
  const speedResultsRef = useRef(speedResults);
  const currentQuestionRef = useRef(currentQuestion);
  const timeRemainingRef = useRef(timeRemaining);
  const filterRef = useRef(filter);
  const speedInputRef = useRef<HTMLInputElement>(null);
  const nextQuestionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep refs synced
  useEffect(() => { progressRef.current = progress; }, [progress]);
  useEffect(() => { badgesRef.current = badges; }, [badges]);
  useEffect(() => { bestStreakRef.current = bestStreak; }, [bestStreak]);
  useEffect(() => { dailyStreakRef.current = dailyStreak; }, [dailyStreak]);
  useEffect(() => { lastPracticeDateRef.current = lastPracticeDate; }, [lastPracticeDate]);
  useEffect(() => { streakRef.current = streak; }, [streak]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { speedResultsRef.current = speedResults; }, [speedResults]);
  useEffect(() => { currentQuestionRef.current = currentQuestion; }, [currentQuestion]);
  useEffect(() => { timeRemainingRef.current = timeRemaining; }, [timeRemaining]);
  useEffect(() => { filterRef.current = filter; }, [filter]);

  /* ================================================================
     Persistence
     ================================================================ */

  const doSave = useCallback(
    (
      p: Record<string, FactData>,
      b: string[],
      bs: number,
      ds: number,
      lpd: string | null
    ) => {
      saveProgress("multiplication", {
        facts: p,
        badges: b,
        bestStreak: bs,
        dailyStreak: ds,
        lastPracticeDate: lpd,
      });
    },
    []
  );

  // Load on mount
  useEffect(() => {
    const saved = loadProgress<SavedData>("multiplication");
    let facts: Record<string, FactData> = {};
    let loadedBadges: string[] = [];
    let bs = 0;
    let ds = 0;
    let lpd: string | null = null;

    if (saved) {
      facts = saved.facts || {};
      loadedBadges = saved.badges || [];
      bs = saved.bestStreak || 0;
      ds = saved.dailyStreak || 0;
      lpd = saved.lastPracticeDate || null;
    }

    facts = initFacts(facts);

    // Check daily streak
    const today = new Date().toDateString();
    if (lpd) {
      const lastDate = new Date(lpd);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (
        lastDate.toDateString() !== yesterday.toDateString() &&
        lastDate.toDateString() !== today
      ) {
        ds = 0;
      }
    }

    setProgress(facts);
    setBadges(loadedBadges);
    setBestStreak(bs);
    setDailyStreak(ds);
    setLastPracticeDate(lpd);
  }, []);

  /* ================================================================
     Badge helpers
     ================================================================ */

  const showCelebration = useCallback((emoji: string) => {
    setCelebration(emoji);
    setTimeout(() => setCelebration(null), 1000);
  }, []);

  const awardBadge = useCallback(
    (badgeId: string, condition: boolean, currentBadges: string[]) => {
      if (condition && !currentBadges.includes(badgeId)) {
        const newBadges = [...currentBadges, badgeId];
        setBadges(newBadges);
        badgesRef.current = newBadges;
        setBadgeNotification(badgeId);
        setTimeout(() => setBadgeNotification(null), 3500);
        return newBadges;
      }
      return currentBadges;
    },
    []
  );

  const checkMasteryBadges = useCallback(
    (prog: Record<string, FactData>, currentBadges: string[]) => {
      let masteredCount = 0;
      const masteredByNumber: Record<number, number> = {};
      for (let i = 0; i <= MAX_NUMBER; i++) masteredByNumber[i] = 0;

      for (let i = 0; i <= MAX_NUMBER; i++) {
        for (let j = 0; j <= MAX_NUMBER; j++) {
          const key = `${i}x${j}`;
          const m = calculateMastery(prog[key]?.history || []);
          if (m === "mastered") {
            masteredCount++;
            masteredByNumber[i]++;
            masteredByNumber[j]++;
          }
        }
      }

      let b = currentBadges;
      b = awardBadge("master_zeros", masteredByNumber[0] >= 13, b);
      b = awardBadge("master_ones", masteredByNumber[1] >= 13, b);
      b = awardBadge("master_twos", masteredByNumber[2] >= 13, b);
      b = awardBadge("master_fives", masteredByNumber[5] >= 13, b);
      b = awardBadge("master_tens", masteredByNumber[10] >= 13, b);

      let squaresMastered = 0;
      for (let i = 0; i <= 12; i++) {
        if (calculateMastery(prog[`${i}x${i}`]?.history || []) === "mastered") {
          squaresMastered++;
        }
      }
      b = awardBadge("master_squares", squaresMastered >= 13, b);
      b = awardBadge("facts_25", masteredCount >= 25, b);
      b = awardBadge("facts_50", masteredCount >= 50, b);
      b = awardBadge("facts_100", masteredCount >= 100, b);
      b = awardBadge("facts_169", masteredCount >= 169, b);
      return b;
    },
    [awardBadge]
  );

  /* ================================================================
     Record practice (daily streak)
     ================================================================ */

  const recordPractice = useCallback(
    (currentBadges: string[], ds: number, lpd: string | null) => {
      const today = new Date().toDateString();
      if (lpd !== today) {
        const newDs = ds + 1;
        setDailyStreak(newDs);
        dailyStreakRef.current = newDs;
        setLastPracticeDate(today);
        lastPracticeDateRef.current = today;
        let b = currentBadges;
        b = awardBadge("daily_3", newDs >= 3, b);
        b = awardBadge("daily_7", newDs >= 7, b);
        return { badges: b, dailyStreak: newDs, lastPracticeDate: today };
      }
      return { badges: currentBadges, dailyStreak: ds, lastPracticeDate: lpd };
    },
    [awardBadge]
  );

  /* ================================================================
     Spaced repetition: get next fact
     ================================================================ */

  const getNextFact = useCallback(
    (
      prog: Record<string, FactData>,
      curQ: QuestionInfo | null,
      f: string
    ): QuestionInfo | null => {
      const candidates: QuestionInfo[] = [];
      const now = Date.now();

      for (let i = 0; i <= MAX_NUMBER; i++) {
        for (let j = 0; j <= MAX_NUMBER; j++) {
          if (f !== "all" && f !== String(i) && f !== String(j)) continue;

          const key = `${i}x${j}`;
          const factData = prog[key] || { history: [], lastPracticed: null };
          const mastery = calculateMastery(factData.history);

          if (recentFactsRef.current.includes(key)) continue;

          let priority = 1;
          if (mastery === "not-practiced") {
            priority = 10;
          } else if (mastery === "learning") {
            priority = 5;
            if (factData.lastPracticed) {
              const hoursSince = (now - factData.lastPracticed) / (1000 * 60 * 60);
              if (hoursSince < 1) priority = 2;
            }
          } else {
            priority = 1;
            if (factData.lastPracticed) {
              const daysSince = (now - factData.lastPracticed) / (1000 * 60 * 60 * 24);
              if (daysSince > 7) priority = 3;
            }
          }

          if (curQ) {
            if (i === curQ.a || i === curQ.b || j === curQ.a || j === curQ.b) {
              priority = Math.max(1, priority - 2);
            }
          }

          for (let w = 0; w < priority; w++) {
            candidates.push({ a: i, b: j, key });
          }
        }
      }

      if (candidates.length === 0) {
        recentFactsRef.current = [];
        // Fallback: random fact
        const fallback: QuestionInfo[] = [];
        for (let i = 0; i <= MAX_NUMBER; i++) {
          for (let j = 0; j <= MAX_NUMBER; j++) {
            if (f !== "all" && f !== String(i) && f !== String(j)) continue;
            fallback.push({ a: i, b: j, key: `${i}x${j}` });
          }
        }
        if (fallback.length === 0) return null;
        return fallback[Math.floor(Math.random() * fallback.length)];
      }

      const selected = candidates[Math.floor(Math.random() * candidates.length)];
      recentFactsRef.current.push(selected.key);
      if (recentFactsRef.current.length > 5) recentFactsRef.current.shift();
      return selected;
    },
    []
  );

  /* ================================================================
     Quiz mode: next question
     ================================================================ */

  const nextQuizQuestion = useCallback(() => {
    const q = getNextFact(progressRef.current, currentQuestionRef.current, filterRef.current);
    if (!q) return;
    const correctAnswer = q.a * q.b;
    const opts = generateOptions(correctAnswer, 0, 144, 4);
    setCurrentQuestion(q);
    setQuizOptions(opts);
    setAnswered(false);
    setUserAnswer(null);
    setShowFeedback(false);
  }, [getNextFact]);

  /* ================================================================
     Quiz mode: check answer
     ================================================================ */

  const checkQuizAnswer = useCallback(
    (chosen: number) => {
      if (answered) return;
      const q = currentQuestionRef.current;
      if (!q) return;

      const correctAnswer = q.a * q.b;
      const isCorrect = chosen === correctAnswer;

      // Update progress
      const newProgress = { ...progressRef.current };
      if (!newProgress[q.key]) {
        newProgress[q.key] = { history: [], lastPracticed: null };
      }
      newProgress[q.key] = {
        history: [
          ...newProgress[q.key].history.slice(-19),
          { correct: isCorrect, timestamp: Date.now() },
        ],
        lastPracticed: Date.now(),
      };
      setProgress(newProgress);
      progressRef.current = newProgress;

      // Streak & score
      let newStreak = streakRef.current;
      let newBest = bestStreakRef.current;
      let newScore = scoreRef.current;

      if (isCorrect) {
        newScore++;
        newStreak++;
        if (newStreak > newBest) newBest = newStreak;
        if (newStreak >= 5) showCelebration("\u{1F525}");
      } else {
        newStreak = 0;
      }

      setScore(newScore);
      scoreRef.current = newScore;
      setStreak(newStreak);
      streakRef.current = newStreak;
      setBestStreak(newBest);
      bestStreakRef.current = newBest;

      // Badges
      let b = badgesRef.current;
      if (isCorrect) {
        b = awardBadge("first_correct", true, b);
        b = awardBadge("streak_5", newStreak >= 5, b);
        b = awardBadge("streak_10", newStreak >= 10, b);
        b = awardBadge("streak_20", newStreak >= 20, b);
      }

      // Daily streak
      const practice = recordPractice(b, dailyStreakRef.current, lastPracticeDateRef.current);
      b = practice.badges;

      // Mastery badges
      b = checkMasteryBadges(newProgress, b);

      // Save
      doSave(newProgress, b, newBest, practice.dailyStreak, practice.lastPracticeDate);

      // Feedback
      const msg = getEncouragement(isCorrect ? "correct" : "incorrect", newStreak);
      setFeedbackMsg(isCorrect ? msg : `${msg} The answer was ${correctAnswer}`);
      setFeedbackCorrect(isCorrect);
      setShowFeedback(true);
      setAnswered(true);
      setUserAnswer(chosen);

      // Next question after delay
      if (nextQuestionTimeoutRef.current) clearTimeout(nextQuestionTimeoutRef.current);
      nextQuestionTimeoutRef.current = setTimeout(() => {
        nextQuizQuestion();
      }, isCorrect ? 1500 : 2500);
    },
    [answered, awardBadge, checkMasteryBadges, doSave, nextQuizQuestion, recordPractice, showCelebration]
  );

  /* ================================================================
     Speed challenge
     ================================================================ */

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const endSpeedChallenge = useCallback(() => {
    stopTimer();
    setSpeedRunning(false);
    setSpeedFinished(true);

    let b = badgesRef.current;
    b = awardBadge("speed_10", scoreRef.current >= 10, b);
    b = awardBadge("speed_20", scoreRef.current >= 20, b);

    doSave(
      progressRef.current,
      b,
      bestStreakRef.current,
      dailyStreakRef.current,
      lastPracticeDateRef.current
    );

    if (scoreRef.current >= 20) showCelebration("\u{1F3C6}");
    else if (scoreRef.current >= 10) showCelebration("\u2B50");
  }, [stopTimer, awardBadge, doSave, showCelebration]);

  const nextSpeedQuestion = useCallback(() => {
    const q = getNextFact(progressRef.current, currentQuestionRef.current, filterRef.current);
    if (!q) return;
    setCurrentQuestion(q);
    setSpeedInput("");
    setSpeedFlash(null);
    setTimeout(() => speedInputRef.current?.focus(), 50);
  }, [getNextFact]);

  const checkSpeedAnswer = useCallback(() => {
    const val = speedInputRef.current?.value?.trim() ?? "";
    if (val === "") return;
    const num = parseInt(val, 10);
    if (isNaN(num)) return;

    const q = currentQuestionRef.current;
    if (!q) return;

    const correctAnswer = q.a * q.b;
    const isCorrect = num === correctAnswer;

    // Update progress
    const newProgress = { ...progressRef.current };
    if (!newProgress[q.key]) {
      newProgress[q.key] = { history: [], lastPracticed: null };
    }
    newProgress[q.key] = {
      history: [
        ...newProgress[q.key].history.slice(-19),
        { correct: isCorrect, timestamp: Date.now() },
      ],
      lastPracticed: Date.now(),
    };
    setProgress(newProgress);
    progressRef.current = newProgress;

    const newResults = [
      ...speedResultsRef.current,
      { question: `${q.a}\u00D7${q.b}`, correct: isCorrect },
    ];
    setSpeedResults(newResults);
    speedResultsRef.current = newResults;

    let newStreak = streakRef.current;
    let newScore = scoreRef.current;
    if (isCorrect) {
      newScore++;
      newStreak++;
    } else {
      newStreak = 0;
    }
    setScore(newScore);
    scoreRef.current = newScore;
    setStreak(newStreak);
    streakRef.current = newStreak;

    setSpeedFlash(isCorrect ? "correct" : "incorrect");

    // Daily streak & save
    const practice = recordPractice(
      badgesRef.current,
      dailyStreakRef.current,
      lastPracticeDateRef.current
    );
    doSave(
      newProgress,
      practice.badges,
      bestStreakRef.current,
      practice.dailyStreak,
      practice.lastPracticeDate
    );

    setTimeout(() => {
      if (timeRemainingRef.current > 0) {
        nextSpeedQuestion();
      }
    }, 300);
  }, [nextSpeedQuestion, recordPractice, doSave]);

  const startSpeedChallenge = useCallback(() => {
    setScore(0);
    scoreRef.current = 0;
    setStreak(0);
    streakRef.current = 0;
    setTimeRemaining(60);
    timeRemainingRef.current = 60;
    setSpeedResults([]);
    speedResultsRef.current = [];
    setSpeedFinished(false);
    setSpeedRunning(true);
    recentFactsRef.current = [];

    // Start first question
    const q = getNextFact(progressRef.current, null, filterRef.current);
    if (q) {
      setCurrentQuestion(q);
      setSpeedInput("");
      setSpeedFlash(null);
      setTimeout(() => speedInputRef.current?.focus(), 100);
    }

    // Start timer
    stopTimer();
    timerRef.current = setInterval(() => {
      const newTime = timeRemainingRef.current - 1;
      timeRemainingRef.current = newTime;
      setTimeRemaining(newTime);
      if (newTime <= 0) {
        endSpeedChallenge();
      }
    }, 1000);
  }, [getNextFact, stopTimer, endSpeedChallenge]);

  /* ================================================================
     Mode switching
     ================================================================ */

  const switchMode = useCallback(
    (newMode: Mode) => {
      stopTimer();
      if (nextQuestionTimeoutRef.current) {
        clearTimeout(nextQuestionTimeoutRef.current);
        nextQuestionTimeoutRef.current = null;
      }
      setMode(newMode);
      setScore(0);
      scoreRef.current = 0;
      setStreak(0);
      streakRef.current = 0;
      setSpeedRunning(false);
      setSpeedFinished(false);
      setSpeedResults([]);
      speedResultsRef.current = [];
      recentFactsRef.current = [];
      setAnswered(false);
      setShowFeedback(false);
      setSelectedCell(null);

      if (newMode === "quiz") {
        // Defer so state is settled
        setTimeout(() => {
          const q = getNextFact(progressRef.current, null, filterRef.current);
          if (q) {
            const correctAnswer = q.a * q.b;
            setCurrentQuestion(q);
            setQuizOptions(generateOptions(correctAnswer, 0, 144, 4));
            setAnswered(false);
            setUserAnswer(null);
            setShowFeedback(false);
          }
        }, 0);
      }
    },
    [stopTimer, getNextFact]
  );

  /* ================================================================
     Reset progress
     ================================================================ */

  const resetProgress = useCallback(() => {
    if (!window.confirm("Reset all progress? This cannot be undone.")) return;
    clearProgress("multiplication");
    const fresh = initFacts({});
    setProgress(fresh);
    progressRef.current = fresh;
    setBadges([]);
    badgesRef.current = [];
    setBestStreak(0);
    bestStreakRef.current = 0;
    setDailyStreak(0);
    dailyStreakRef.current = 0;
    setLastPracticeDate(null);
    lastPracticeDateRef.current = null;
    setSelectedCell(null);
  }, []);

  /* ================================================================
     Cleanup on unmount / visibility
     ================================================================ */

  useEffect(() => {
    const onVisChange = () => {
      if (document.hidden && timerRef.current) {
        stopTimer();
        setSpeedRunning(false);
        setSpeedFinished(true);
      }
    };
    document.addEventListener("visibilitychange", onVisChange);
    return () => {
      stopTimer();
      if (nextQuestionTimeoutRef.current) clearTimeout(nextQuestionTimeoutRef.current);
      document.removeEventListener("visibilitychange", onVisChange);
    };
  }, [stopTimer]);

  /* ================================================================
     Computed values
     ================================================================ */

  const { mastered, learning, total } = (() => {
    let m = 0, l = 0, t = 0;
    for (let i = 0; i <= MAX_NUMBER; i++) {
      for (let j = 0; j <= MAX_NUMBER; j++) {
        t++;
        const key = `${i}x${j}`;
        const level = calculateMastery(progress[key]?.history || []);
        if (level === "mastered") m++;
        else if (level === "learning") l++;
      }
    }
    return { mastered: m, learning: l, total: t };
  })();

  const masteredPct = total > 0 ? (mastered / total) * 100 : 0;
  const learningPct = total > 0 ? (learning / total) * 100 : 0;
  const badgeCount = badges.length;
  const totalBadges = Object.keys(BADGES).length;

  /* ================================================================
     Render helpers
     ================================================================ */

  const masteryColor = (level: MasteryLevel) => {
    switch (level) {
      case "mastered":
        return "bg-gradient-to-br from-green-500 to-green-600 text-white";
      case "learning":
        return "bg-gradient-to-br from-amber-400 to-amber-500 text-white";
      default:
        return "bg-white text-gray-700";
    }
  };

  /* ================================================================
     LEARN MODE
     ================================================================ */

  const renderLearnMode = () => (
    <div>
      {/* Instructions */}
      <div className="mb-5 rounded-r-lg border-l-4 border-warning bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <p>Tap any cell to see the equation and visual array. Colors show your mastery!</p>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-text-muted">
          <span><Trophy size={14} className="mr-1 inline" />{badgeCount}/{totalBadges} Badges</span>
          {dailyStreak > 0 && <span><Flame size={14} className="mr-1 inline text-orange-500" />{dailyStreak} day streak</span>}
          {bestStreak > 0 && <span><Zap size={14} className="mr-1 inline text-yellow-500" />Best: {bestStreak} in a row</span>}
        </div>
      </div>

      {/* Filter buttons */}
      <div className="mb-5 rounded-xl bg-gray-50 p-4">
        <h4 className="mb-3 text-center text-sm font-semibold text-gray-700">Filter by number:</h4>
        <div className="flex flex-wrap justify-center gap-1.5">
          <button
            onClick={() => setFilter("all")}
            className={`min-h-[40px] min-w-[40px] cursor-pointer rounded-full border-2 px-3 py-2 text-sm font-semibold transition-all ${
              filter === "all"
                ? "border-tool-purple bg-tool-purple text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-tool-purple/50"
            }`}
          >
            All
          </button>
          {Array.from({ length: 13 }, (_, i) => (
            <button
              key={i}
              onClick={() => setFilter(String(i))}
              className={`min-h-[40px] min-w-[40px] cursor-pointer rounded-full border-2 px-3 py-2 text-sm font-semibold transition-all ${
                filter === String(i)
                  ? "border-tool-purple bg-tool-purple text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-tool-purple/50"
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      {/* Equation display */}
      {selectedCell && (
        <div className="mb-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-5 text-center text-2xl font-bold text-indigo-800 md:text-3xl lg:text-4xl">
          {selectedCell.row} &times; {selectedCell.col} ={" "}
          <span className="text-success">{selectedCell.row * selectedCell.col}</span>
        </div>
      )}

      {/* Array visualization */}
      {selectedCell && (
        <div className="mb-4">
          {selectedCell.row === 0 || selectedCell.col === 0 ? (
            <p className="text-center text-sm text-text-muted">Any number &times; 0 = 0</p>
          ) : (
            <>
              <div
                className="mx-auto max-w-[300px] rounded-xl bg-blue-50 p-4"
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${Math.min(selectedCell.col, 10)}, 1fr)`,
                  gap: "4px",
                }}
              >
                {Array.from(
                  { length: Math.min(selectedCell.row, 10) * Math.min(selectedCell.col, 10) },
                  (_, idx) => (
                    <div
                      key={idx}
                      className="mx-auto h-5 w-5 rounded-full bg-tool-purple"
                    />
                  )
                )}
              </div>
              <p className="mt-2 text-center text-xs text-text-muted">
                {selectedCell.row > 10 || selectedCell.col > 10
                  ? `${selectedCell.row} rows \u00D7 ${selectedCell.col} columns = ${selectedCell.row * selectedCell.col} (showing ${Math.min(selectedCell.row, 10)}\u00D7${Math.min(selectedCell.col, 10)})`
                  : `${selectedCell.row} rows \u00D7 ${selectedCell.col} columns = ${selectedCell.row * selectedCell.col} dots`}
              </p>
            </>
          )}
        </div>
      )}

      {/* Multiplication table */}
      <div className="-mx-4 overflow-x-auto px-4 pb-4">
        <div
          className="min-w-[480px] gap-[2px] rounded-xl bg-gray-200 p-[2px]"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(14, minmax(32px, 1fr))`,
          }}
        >
          {/* Corner */}
          <div className="flex aspect-square min-h-[32px] items-center justify-center rounded bg-gradient-to-br from-indigo-700 to-violet-700 text-base font-bold text-white sm:min-h-[38px] md:min-h-[45px]">
            &times;
          </div>
          {/* Column headers */}
          {Array.from({ length: 13 }, (_, j) => (
            <div
              key={`ch-${j}`}
              className="flex aspect-square min-h-[32px] items-center justify-center rounded bg-gradient-to-br from-tool-purple to-violet-500 text-xs font-bold text-white sm:min-h-[38px] sm:text-sm md:min-h-[45px] md:text-base"
            >
              {j}
            </div>
          ))}
          {/* Rows */}
          {Array.from({ length: 13 }, (_, i) => (
            <React.Fragment key={`row-${i}`}>
              {/* Row header */}
              <div
                className="flex aspect-square min-h-[32px] items-center justify-center rounded bg-gradient-to-br from-tool-purple to-violet-500 text-xs font-bold text-white sm:min-h-[38px] sm:text-sm md:min-h-[45px] md:text-base"
              >
                {i}
              </div>
              {/* Cells */}
              {Array.from({ length: 13 }, (_, j) => {
                const key = `${i}x${j}`;
                const level = calculateMastery(progress[key]?.history || []);
                const visible = filter === "all" || filter === String(i) || filter === String(j);
                const isSelected = selectedCell?.row === i && selectedCell?.col === j;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCell({ row: i, col: j })}
                    className={`flex aspect-square min-h-[32px] cursor-pointer items-center justify-center rounded text-xs font-semibold transition-all select-none sm:min-h-[38px] sm:text-sm md:min-h-[45px] md:text-base ${masteryColor(level)} ${
                      !visible ? "opacity-30" : ""
                    } ${
                      isSelected
                        ? "z-10 scale-110 ring-3 ring-tool-purple"
                        : "hover:z-10 hover:scale-110 hover:shadow-md"
                    }`}
                  >
                    {i * j}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="mt-5">
        <h4 className="mb-3 text-center font-semibold text-text">Your Badges</h4>
        <div className="flex flex-wrap justify-center gap-2.5">
          {Object.entries(BADGES).map(([id, badge]) => {
            const earned = badges.includes(id);
            return (
              <div
                key={id}
                title={badge.desc}
                className={`flex min-w-[80px] flex-col items-center rounded-xl p-2.5 transition-transform hover:scale-105 ${
                  earned
                    ? "bg-gradient-to-br from-amber-100 to-amber-200"
                    : "bg-gray-50 opacity-50"
                }`}
              >
                <span className="mb-1 text-2xl">{earned ? badge.icon : "\u{1F512}"}</span>
                <span className="text-center text-[0.7rem] text-gray-700">{badge.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  /* ================================================================
     QUIZ MODE
     ================================================================ */

  const renderQuizMode = () => {
    const q = currentQuestion;
    if (!q) return <p className="text-center text-text-muted">Loading...</p>;

    const correctAnswer = q.a * q.b;
    const mastery = calculateMastery(progress[q.key]?.history || []);
    const showHint =
      (mastery === "not-practiced" || mastery === "learning") && q.a <= 5 && q.b <= 5;

    return (
      <div className="py-5 text-center">
        {/* Stats */}
        <div className="mb-5 flex flex-wrap justify-center gap-4">
          <div className="rounded-xl bg-gray-50 px-6 py-3 text-center">
            <span className="block text-xs text-text-muted">Score</span>
            <span className="text-2xl font-bold text-tool-purple">{score}</span>
          </div>
          <div className="rounded-xl bg-gray-50 px-6 py-3 text-center">
            <span className="block text-xs text-text-muted">Streak</span>
            <span className="text-2xl font-bold text-tool-purple">{streak}</span>
          </div>
          <div className="rounded-xl bg-gray-50 px-6 py-3 text-center">
            <span className="block text-xs text-text-muted">Best</span>
            <span className="text-2xl font-bold text-tool-purple">{bestStreak}</span>
          </div>
        </div>

        {/* Visual hint */}
        {showHint && q.a > 0 && q.b > 0 && (
          <div className="mb-4">
            <div
              className="mx-auto inline-grid gap-[3px] rounded-lg bg-blue-50 p-2"
              style={{ gridTemplateColumns: `repeat(${q.b}, 1fr)` }}
            >
              {Array.from({ length: q.a * q.b }, (_, idx) => (
                <div key={idx} className="h-3 w-3 rounded-full bg-tool-purple" />
              ))}
            </div>
          </div>
        )}
        {showHint && (q.a === 0 || q.b === 0) && (
          <p className="mb-4 text-xs text-text-muted">Hint: &times; 0 = 0</p>
        )}

        {/* Problem */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3 text-4xl font-bold text-gray-800 sm:text-5xl lg:text-6xl">
          <span>{q.a}</span>
          <span className="text-tool-purple">&times;</span>
          <span>{q.b}</span>
          <span className="text-gray-400">=</span>
          <span>?</span>
        </div>

        {/* Options */}
        <div className="mx-auto grid max-w-[320px] grid-cols-2 gap-3 sm:max-w-[400px] sm:gap-4">
          {quizOptions.map((opt) => {
            let btnClass =
              "min-h-[60px] cursor-pointer rounded-xl border-3 bg-white p-4 text-xl font-bold transition-all sm:min-h-[70px] sm:text-2xl";
            if (answered) {
              if (opt === correctAnswer) {
                btnClass += " border-green-500 bg-green-50 text-green-800";
              } else if (opt === userAnswer && !feedbackCorrect) {
                btnClass += " border-red-500 bg-red-50 text-red-800";
              } else {
                btnClass += " border-gray-200 opacity-50";
              }
            } else {
              btnClass += " border-gray-200 hover:border-tool-purple active:scale-95";
            }
            return (
              <button
                key={opt}
                onClick={() => checkQuizAnswer(opt)}
                disabled={answered}
                className={btnClass}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div
            className={`mt-4 animate-[fadeIn_0.3s_ease] rounded-xl p-4 text-lg font-semibold ${
              feedbackCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}
          >
            {feedbackMsg}
          </div>
        )}

        {/* Fact family */}
        {answered && q.a > 1 && q.b > 1 && (
          <div className="mt-3 rounded-lg bg-gray-50 p-3 text-center">
            <small className="text-text-muted">Fact Family:</small>
            <div className="mt-1 text-sm text-gray-700">
              {q.a} &times; {q.b} = {q.a * q.b} &nbsp;&bull;&nbsp;
              {q.b} &times; {q.a} = {q.a * q.b} &nbsp;&bull;&nbsp;
              {q.a * q.b} &divide; {q.a} = {q.b} &nbsp;&bull;&nbsp;
              {q.a * q.b} &divide; {q.b} = {q.a}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ================================================================
     SPEED CHALLENGE MODE
     ================================================================ */

  const renderSpeedMode = () => {
    const speedAccuracy =
      speedResults.length > 0
        ? Math.round(
            (speedResults.filter((r) => r.correct).length / speedResults.length) * 100
          )
        : 0;

    return (
      <div className="text-center">
        {/* Header stats */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
          <div className="min-w-[80px] rounded-xl bg-gray-100 px-5 py-3">
            <span className="block text-xs text-text-muted">Score</span>
            <span className="text-2xl font-bold text-tool-purple">{score}</span>
          </div>
          <div className="min-w-[80px] rounded-xl bg-gray-100 px-5 py-3">
            <span className="block text-xs text-text-muted">Time</span>
            <span
              className={`text-2xl font-bold ${
                timeRemaining <= 10 ? "animate-pulse text-warning" : "text-amber-500"
              }`}
            >
              {formatTime(timeRemaining)}
            </span>
          </div>
          <div className="min-w-[80px] rounded-xl bg-gray-100 px-5 py-3">
            <span className="block text-xs text-text-muted">Streak</span>
            <span className="text-2xl font-bold text-tool-purple">{streak}</span>
          </div>
        </div>

        {/* Not started yet */}
        {!speedRunning && !speedFinished && (
          <div>
            <p className="mb-5 text-text-muted">
              Answer as many problems as you can in 60 seconds!
              <br />
              <small>Focus on facts you&apos;re still learning for best results.</small>
            </p>
            <button
              onClick={startSpeedChallenge}
              className="min-h-[56px] cursor-pointer rounded-full bg-gradient-to-r from-tool-purple to-violet-500 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-300/40 transition-all hover:shadow-xl active:scale-95"
            >
              Start Challenge
            </button>
          </div>
        )}

        {/* Running */}
        {speedRunning && currentQuestion && (
          <div>
            <div className="mb-5 text-4xl font-bold text-gray-800 sm:text-5xl">
              {currentQuestion.a} &times; {currentQuestion.b} =
            </div>
            <input
              ref={speedInputRef}
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={speedInput}
              onChange={(e) => setSpeedInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") checkSpeedAnswer();
              }}
              className={`mx-auto mb-4 block w-[150px] rounded-2xl border-4 p-4 text-center text-3xl font-bold outline-none transition-colors ${
                speedFlash === "correct"
                  ? "border-green-500 bg-green-50"
                  : speedFlash === "incorrect"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 focus:border-tool-purple"
              }`}
            />
            <button
              onClick={checkSpeedAnswer}
              className="min-h-[56px] cursor-pointer rounded-full bg-gradient-to-r from-tool-purple to-violet-500 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-300/40 transition-all hover:shadow-xl active:scale-95"
            >
              Submit
            </button>
          </div>
        )}

        {/* Finished */}
        {speedFinished && (
          <div className="mt-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 text-center">
            <h2 className="mb-4 text-2xl font-bold text-green-800">Time&apos;s Up!</h2>
            <div className="mb-5 grid grid-cols-3 gap-3">
              {[
                { label: "Score", value: score },
                { label: "Questions", value: speedResults.length },
                { label: "Accuracy", value: `${speedAccuracy}%` },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white p-4">
                  <span className="block text-xs text-text-muted">{stat.label}</span>
                  <span className="text-2xl font-bold text-green-800">{stat.value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={startSpeedChallenge}
              className="min-h-[56px] cursor-pointer rounded-full bg-gradient-to-r from-tool-purple to-violet-500 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-300/40 transition-all hover:shadow-xl active:scale-95"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    );
  };

  /* ================================================================
     MAIN RENDER
     ================================================================ */

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream pt-20 pb-12">
        <div className="mx-auto max-w-[900px] px-3 sm:px-5">
          {/* Back link */}
          <a
            href="/#tools"
            className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-tool-purple/10 px-4 py-2 text-sm font-medium text-tool-purple transition-colors hover:bg-tool-purple/20"
          >
            <ArrowLeft size={16} />
            Back to Home
          </a>

          {/* Card */}
          <div className="clay-card overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-tool-purple to-violet-500 px-4 py-5 text-center text-white sm:px-8 sm:py-8">
              <h1 className="font-[family-name:var(--font-varela-round)] text-2xl font-bold sm:text-3xl lg:text-4xl">
                Multiplication Practice
              </h1>
              <p className="mt-1 text-sm opacity-90 sm:text-base">
                Master your times tables with visual learning
              </p>
            </div>

            {/* Content area */}
            <div className="p-4 sm:p-6 lg:p-8">
              {/* Progress bar */}
              <div className="mb-5 rounded-xl bg-gray-50 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-text">Overall Progress</h3>
                  <span className="text-xs text-text-muted">
                    {mastered} mastered, {learning} learning, {total - mastered - learning} to go
                  </span>
                </div>
                <div className="flex h-4 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="bg-success transition-all duration-300"
                    style={{ width: `${masteredPct}%` }}
                  />
                  <div
                    className="bg-warning transition-all duration-300"
                    style={{ width: `${learningPct}%` }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap justify-center gap-4">
                  <span className="flex items-center gap-1.5 text-xs text-text-muted">
                    <span className="inline-block h-3 w-3 rounded-full bg-success" /> Mastered
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-text-muted">
                    <span className="inline-block h-3 w-3 rounded-full bg-warning" /> Learning
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-text-muted">
                    <span className="inline-block h-3 w-3 rounded-full bg-gray-200" /> Not practiced
                  </span>
                </div>
              </div>

              {/* Mode tabs */}
              <div className="mb-5 flex flex-wrap justify-center gap-1.5">
                {([
                  { id: "learn" as Mode, label: "Learn", icon: BookOpen },
                  { id: "quiz" as Mode, label: "Quiz", icon: HelpCircle },
                  { id: "speed" as Mode, label: "Speed", icon: Timer },
                ]).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => switchMode(tab.id)}
                    className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                      mode === tab.id
                        ? "bg-tool-purple text-white shadow-lg shadow-indigo-300/40"
                        : "bg-gray-100 text-text hover:bg-gray-200"
                    }`}
                    aria-selected={mode === tab.id}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Mode content */}
              {mode === "learn" && renderLearnMode()}
              {mode === "quiz" && renderQuizMode()}
              {mode === "speed" && renderSpeedMode()}

              {/* Reset button */}
              <div className="mt-8 text-center">
                <button
                  onClick={resetProgress}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-xs text-text-muted transition-colors hover:bg-red-50 hover:text-error"
                >
                  <RotateCcw size={14} />
                  Reset Progress
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Badge notification */}
        {badgeNotification && BADGES[badgeNotification] && (
          <div className="fixed top-5 left-1/2 z-[1000] -translate-x-1/2 animate-[slideDown_0.5s_ease] rounded-xl bg-gradient-to-br from-tool-purple to-violet-500 px-6 py-4 text-center text-white shadow-xl shadow-indigo-400/40">
            <div className="mb-1 text-3xl">{BADGES[badgeNotification].icon}</div>
            <div className="font-semibold">Badge Earned!</div>
            <div className="text-sm opacity-90">{BADGES[badgeNotification].name}</div>
          </div>
        )}

        {/* Celebration */}
        {celebration && (
          <div className="pointer-events-none fixed top-1/2 left-1/2 z-[1000] -translate-x-1/2 -translate-y-1/2 animate-[celebrate_1s_ease-out_forwards] text-6xl">
            {celebration}
          </div>
        )}
      </main>
      <Footer />

      {/* Keyframe animations */}
      <style jsx global>{`
        @keyframes slideDown {
          from {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes celebrate {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.5);
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-8px);
          }
          75% {
            transform: translateX(8px);
          }
        }
      `}</style>
    </>
  );
}
