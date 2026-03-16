"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  BookOpen,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Check,
  List,
  RotateCcw,
  Lightbulb,
  Trophy,
  Flame,
  Star,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  saveProgress,
  loadProgress,
  clearProgress,
  getEncouragement,
  shuffleArray,
  calculateMastery,
} from "@/lib/tools-common";
import type { HistoryEntry, MasteryLevel } from "@/lib/tools-common";

// ─── Data ────────────────────────────────────────────────────────────────────

type Grade = "prek" | "k" | "1" | "2" | "3";

const WORD_LISTS: Record<Grade, string[]> = {
  prek: [
    "a","and","away","big","blue","can","come","down","find","for",
    "funny","go","help","here","I","in","is","it","jump","little",
    "look","make","me","my","not","one","play","red","run","said",
    "see","the","three","to","two","up","we","where","yellow","you",
  ],
  k: [
    "all","am","are","at","ate","be","black","brown","but","came",
    "did","do","eat","four","get","good","have","he","into","like",
    "must","new","no","now","on","our","out","please","pretty","ran",
    "ride","saw","say","she","so","soon","that","there","they","this",
    "too","under","want","was","well","went","what","white","who","will",
    "with","yes",
  ],
  "1": [
    "after","again","an","any","as","ask","by","could","every","fly",
    "from","give","going","had","has","her","him","his","how","just",
    "know","let","live","may","of","old","once","open","over","put",
    "round","some","stop","take","thank","them","then","think","walk","were",
    "when",
  ],
  "2": [
    "always","around","because","been","before","best","both","buy","call","cold",
    "does","dont","fast","first","five","found","gave","goes","green","its",
    "made","many","off","or","pull","read","right","sing","sit","sleep",
    "tell","their","these","those","upon","us","use","very","wash","which",
    "why","wish","work","would","write","your",
  ],
  "3": [
    "about","better","bring","carry","clean","cut","done","draw","drink","eight",
    "fall","far","full","got","grow","hold","hot","hurt","if","keep",
    "kind","laugh","light","long","much","myself","never","only","own","pick",
    "seven","shall","show","six","small","start","ten","today","together","try",
    "warm",
  ],
};

const GRADE_NAMES: Record<Grade, string> = {
  prek: "Pre-K",
  k: "Kindergarten",
  "1": "1st Grade",
  "2": "2nd Grade",
  "3": "3rd Grade",
};

const GRADES: Grade[] = ["prek", "k", "1", "2", "3"];

interface BadgeDef {
  name: string;
  icon: string;
  desc: string;
}

const BADGES: Record<string, BadgeDef> = {
  first_word: { name: "First Word", icon: "\u{1F31F}", desc: "Learn your first sight word" },
  streak_5: { name: "On a Roll", icon: "\u{1F525}", desc: "Get 5 correct in a row" },
  streak_10: { name: "Super Reader", icon: "\u26A1", desc: "Get 10 correct in a row" },
  streak_20: { name: "Reading Champion", icon: "\u{1F451}", desc: "Get 20 correct in a row" },
  words_10: { name: "Word Learner", icon: "\u{1F4DA}", desc: "Master 10 words" },
  words_25: { name: "Word Explorer", icon: "\u{1F5FA}\uFE0F", desc: "Master 25 words" },
  words_50: { name: "Word Collector", icon: "\u{1F48E}", desc: "Master 50 words" },
  words_100: { name: "Word Master", icon: "\u{1F3C6}", desc: "Master 100 words" },
  prek_complete: { name: "Pre-K Pro", icon: "\u{1F392}", desc: "Master all Pre-K words" },
  k_complete: { name: "Kindergarten King", icon: "\u{1F393}", desc: "Master all Kindergarten words" },
  grade1_complete: { name: "First Grade Star", icon: "\u2B50", desc: "Master all 1st Grade words" },
  grade2_complete: { name: "Second Grade Superstar", icon: "\u{1F308}", desc: "Master all 2nd Grade words" },
  grade3_complete: { name: "Third Grade Genius", icon: "\u{1F9E0}", desc: "Master all 3rd Grade words" },
  spelling_5: { name: "Speller", icon: "\u270F\uFE0F", desc: "Spell 5 words correctly" },
  spelling_25: { name: "Spelling Bee", icon: "\u{1F41D}", desc: "Spell 25 words correctly" },
  daily_3: { name: "Dedicated Reader", icon: "\u{1F4C5}", desc: "Practice 3 days in a row" },
  daily_7: { name: "Weekly Reader", icon: "\u{1F5D3}\uFE0F", desc: "Practice 7 days in a row" },
};

type Mode = "flashcards" | "quiz" | "spelling";

interface WordProgress {
  history: HistoryEntry[];
  lastPracticed: number | null;
}

interface SavedData {
  words: Record<string, WordProgress>;
  badges: string[];
  bestStreak: number;
  dailyStreak: number;
  lastPracticeDate: string | null;
  lastGrade: Grade;
  spellingCorrect: number;
}

// ─── Speech helper ───────────────────────────────────────────────────────────

function speakWord(word: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = 0.7;
  utterance.pitch = 1.1;
  utterance.volume = 1;
  const voices = speechSynthesis.getVoices();
  const englishVoice =
    voices.find((v) => v.lang.startsWith("en") && v.name.includes("Female")) ||
    voices.find((v) => v.lang.startsWith("en-US")) ||
    voices.find((v) => v.lang.startsWith("en"));
  if (englishVoice) utterance.voice = englishVoice;
  speechSynthesis.speak(utterance);
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SightWordsPage() {
  // Core state
  const [currentGrade, setCurrentGrade] = useState<Grade>("prek");
  const [currentMode, setCurrentMode] = useState<Mode>("flashcards");
  const [progress, setProgress] = useState<Record<string, WordProgress>>({});
  const [badges, setBadges] = useState<string[]>([]);
  const [bestStreak, setBestStreak] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [lastPracticeDate, setLastPracticeDate] = useState<string | null>(null);
  const [spellingCorrect, setSpellingCorrect] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Flashcard state
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showWordList, setShowWordList] = useState(false);

  // Quiz state
  const [quizWord, setQuizWord] = useState("");
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizScore, setQuizScore] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<{
    show: boolean;
    correct: boolean;
    message: string;
  }>({ show: false, correct: false, message: "" });
  const [quizAnswered, setQuizAnswered] = useState<string | null>(null);
  const [quizCorrectWord, setQuizCorrectWord] = useState("");

  // Spelling state
  const [spellingWord, setSpellingWord] = useState("");
  const [spellingInput, setSpellingInput] = useState("");
  const [spellingScore, setSpellingScore] = useState(0);
  const [spellingStreak, setSpellingStreak] = useState(0);
  const [spellingFeedback, setSpellingFeedback] = useState<{
    show: boolean;
    correct: boolean;
    message: string;
  }>({ show: false, correct: false, message: "" });
  const [spellingDisabled, setSpellingDisabled] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [spellingInputState, setSpellingInputState] = useState<
    "" | "correct" | "incorrect"
  >("");

  // Celebration / badge notification
  const [celebration, setCelebration] = useState<string | null>(null);
  const [badgeNotification, setBadgeNotification] = useState<BadgeDef | null>(
    null
  );

  // Recent words for spaced repetition
  const recentWordsRef = useRef<string[]>([]);

  // Refs for latest state in callbacks
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const badgesRef = useRef(badges);
  badgesRef.current = badges;
  const bestStreakRef = useRef(bestStreak);
  bestStreakRef.current = bestStreak;
  const dailyStreakRef = useRef(dailyStreak);
  dailyStreakRef.current = dailyStreak;
  const lastPracticeDateRef = useRef(lastPracticeDate);
  lastPracticeDateRef.current = lastPracticeDate;
  const spellingCorrectRef = useRef(spellingCorrect);
  spellingCorrectRef.current = spellingCorrect;
  const currentGradeRef = useRef(currentGrade);
  currentGradeRef.current = currentGrade;

  const spellingInputRef = useRef<HTMLInputElement>(null);

  // ─── Persistence ─────────────────────────────────────────────────────────

  const doSave = useCallback(
    (overrides?: Partial<SavedData>) => {
      const data: SavedData = {
        words: overrides?.words ?? progressRef.current,
        badges: overrides?.badges ?? badgesRef.current,
        bestStreak: overrides?.bestStreak ?? bestStreakRef.current,
        dailyStreak: overrides?.dailyStreak ?? dailyStreakRef.current,
        lastPracticeDate:
          overrides?.lastPracticeDate ?? lastPracticeDateRef.current,
        lastGrade: overrides?.lastGrade ?? currentGradeRef.current,
        spellingCorrect:
          overrides?.spellingCorrect ?? spellingCorrectRef.current,
      };
      saveProgress("sight_words", data);
    },
    []
  );

  // Load on mount
  useEffect(() => {
    const saved = loadProgress<SavedData>("sight_words");
    const wordProgress: Record<string, WordProgress> = saved?.words ?? {};

    // Initialize all words
    for (const grade of GRADES) {
      for (const word of WORD_LISTS[grade]) {
        const key = `${grade}_${word}`;
        if (!wordProgress[key]) {
          wordProgress[key] = { history: [], lastPracticed: null };
        }
      }
    }

    setProgress(wordProgress);
    setBadges(saved?.badges ?? []);
    setBestStreak(saved?.bestStreak ?? 0);
    setSpellingCorrect(saved?.spellingCorrect ?? 0);

    const savedGrade = saved?.lastGrade ?? "prek";
    setCurrentGrade(savedGrade);
    currentGradeRef.current = savedGrade;

    // Daily streak check
    let ds = saved?.dailyStreak ?? 0;
    const lp = saved?.lastPracticeDate ?? null;
    if (lp) {
      const lastDate = new Date(lp);
      const today = new Date().toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (
        lastDate.toDateString() !== yesterday.toDateString() &&
        lastDate.toDateString() !== today
      ) {
        ds = 0;
      }
    }
    setDailyStreak(ds);
    setLastPracticeDate(lp);

    // Load voices
    if ("speechSynthesis" in window) {
      speechSynthesis.getVoices();
      speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
    }

    setLoaded(true);
  }, []);

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const celebrate = useCallback((emoji: string) => {
    setCelebration(emoji);
    setTimeout(() => setCelebration(null), 1000);
  }, []);

  const showBadgeNotif = useCallback((badgeId: string) => {
    const badge = BADGES[badgeId];
    if (!badge) return;
    setBadgeNotification(badge);
    setTimeout(() => setBadgeNotification(null), 3000);
  }, []);

  const checkBadge = useCallback(
    (
      badgeId: string,
      condition: boolean,
      currentBadges: string[]
    ): string[] => {
      if (condition && !currentBadges.includes(badgeId)) {
        const newBadges = [...currentBadges, badgeId];
        showBadgeNotif(badgeId);
        return newBadges;
      }
      return currentBadges;
    },
    [showBadgeNotif]
  );

  const checkMasteryBadges = useCallback(
    (prog: Record<string, WordProgress>, currentBadges: string[]): string[] => {
      let totalMastered = 0;
      const masteredByGrade: Record<string, number> = {};

      for (const grade of GRADES) {
        masteredByGrade[grade] = 0;
        for (const word of WORD_LISTS[grade]) {
          const key = `${grade}_${word}`;
          if (
            calculateMastery(prog[key]?.history ?? []) === "mastered"
          ) {
            totalMastered++;
            masteredByGrade[grade]++;
          }
        }
      }

      let b = currentBadges;
      b = checkBadge("words_10", totalMastered >= 10, b);
      b = checkBadge("words_25", totalMastered >= 25, b);
      b = checkBadge("words_50", totalMastered >= 50, b);
      b = checkBadge("words_100", totalMastered >= 100, b);
      b = checkBadge(
        "prek_complete",
        masteredByGrade.prek >= WORD_LISTS.prek.length,
        b
      );
      b = checkBadge(
        "k_complete",
        masteredByGrade.k >= WORD_LISTS.k.length,
        b
      );
      b = checkBadge(
        "grade1_complete",
        (masteredByGrade["1"] ?? 0) >= WORD_LISTS["1"].length,
        b
      );
      b = checkBadge(
        "grade2_complete",
        (masteredByGrade["2"] ?? 0) >= WORD_LISTS["2"].length,
        b
      );
      b = checkBadge(
        "grade3_complete",
        (masteredByGrade["3"] ?? 0) >= WORD_LISTS["3"].length,
        b
      );
      return b;
    },
    [checkBadge]
  );

  const recordPractice = useCallback(() => {
    const today = new Date().toDateString();
    if (lastPracticeDateRef.current !== today) {
      const newDs = dailyStreakRef.current + 1;
      setDailyStreak(newDs);
      dailyStreakRef.current = newDs;
      setLastPracticeDate(today);
      lastPracticeDateRef.current = today;

      let b = badgesRef.current;
      b = checkBadge("daily_3", newDs >= 3, b);
      b = checkBadge("daily_7", newDs >= 7, b);
      if (b !== badgesRef.current) {
        setBadges(b);
        badgesRef.current = b;
      }
    }
  }, [checkBadge]);

  const recordWordAttempt = useCallback(
    (
      grade: Grade,
      word: string,
      correct: boolean,
      prog: Record<string, WordProgress>
    ): Record<string, WordProgress> => {
      const key = `${grade}_${word}`;
      const updated = { ...prog };
      const wp = updated[key]
        ? { ...updated[key], history: [...updated[key].history] }
        : { history: [] as HistoryEntry[], lastPracticed: null as number | null };
      wp.history.push({ correct, timestamp: Date.now() });
      if (wp.history.length > 20) wp.history = wp.history.slice(-20);
      wp.lastPracticed = Date.now();
      updated[key] = wp;
      return updated;
    },
    []
  );

  // Spaced repetition: get next word
  const getNextWord = useCallback(
    (grade: Grade, prog: Record<string, WordProgress>): string => {
      const words = WORD_LISTS[grade];
      const candidates: string[] = [];
      const now = Date.now();

      for (const word of words) {
        if (recentWordsRef.current.includes(word)) continue;
        const key = `${grade}_${word}`;
        const wordData = prog[key] ?? { history: [], lastPracticed: null };
        const mastery = calculateMastery(wordData.history);
        let priority = 1;

        if (mastery === "not-practiced") {
          priority = 10;
        } else if (mastery === "learning") {
          priority = 5;
          if (wordData.lastPracticed) {
            const hoursSince =
              (now - wordData.lastPracticed) / (1000 * 60 * 60);
            if (hoursSince < 1) priority = 2;
          }
        } else {
          priority = 1;
          if (wordData.lastPracticed) {
            const daysSince =
              (now - wordData.lastPracticed) / (1000 * 60 * 60 * 24);
            if (daysSince > 7) priority = 3;
          }
        }

        for (let i = 0; i < priority; i++) candidates.push(word);
      }

      let selected: string;
      if (candidates.length === 0) {
        recentWordsRef.current = [];
        selected = words[Math.floor(Math.random() * words.length)];
      } else {
        selected = candidates[Math.floor(Math.random() * candidates.length)];
      }

      recentWordsRef.current.push(selected);
      if (recentWordsRef.current.length > 5) recentWordsRef.current.shift();
      return selected;
    },
    []
  );

  // ─── Progress bar computation ────────────────────────────────────────────

  const words = WORD_LISTS[currentGrade];
  let masteredCount = 0;
  let learningCount = 0;
  for (const word of words) {
    const key = `${currentGrade}_${word}`;
    const level = calculateMastery(progress[key]?.history ?? []);
    if (level === "mastered") masteredCount++;
    else if (level === "learning") learningCount++;
  }
  const masteredPct = (masteredCount / words.length) * 100;
  const learningPct = (learningCount / words.length) * 100;

  // ─── Mode switching ──────────────────────────────────────────────────────

  const switchGrade = useCallback(
    (grade: Grade) => {
      setCurrentGrade(grade);
      currentGradeRef.current = grade;
      setCurrentWordIndex(0);
      setIsFlipped(false);
      setShowWordList(false);
      recentWordsRef.current = [];
      doSave({ lastGrade: grade });
    },
    [doSave]
  );

  const switchMode = useCallback((mode: Mode) => {
    setCurrentMode(mode);
    setQuizScore(0);
    setQuizStreak(0);
    setSpellingScore(0);
    setSpellingStreak(0);
    setCurrentWordIndex(0);
    setIsFlipped(false);
    setShowWordList(false);
    recentWordsRef.current = [];
  }, []);

  // ─── Quiz logic ──────────────────────────────────────────────────────────

  const startQuizQuestion = useCallback(
    (grade: Grade, prog: Record<string, WordProgress>) => {
      const word = getNextWord(grade, prog);
      const allWords = WORD_LISTS[grade];
      const otherWords = allWords.filter((w) => w !== word);
      const distractors = shuffleArray(otherWords).slice(0, 3);
      const options = shuffleArray([word, ...distractors]);

      setQuizWord(word);
      setQuizCorrectWord(word);
      setQuizOptions(options);
      setQuizAnswered(null);
      setQuizFeedback({ show: false, correct: false, message: "" });

      setTimeout(() => speakWord(word), 500);
    },
    [getNextWord]
  );

  // Initialize quiz when mode changes to quiz
  useEffect(() => {
    if (loaded && currentMode === "quiz") {
      startQuizQuestion(currentGrade, progress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMode, currentGrade, loaded]);

  const handleQuizAnswer = useCallback(
    (selected: string) => {
      if (quizAnswered) return;
      const correct = quizCorrectWord;
      const isCorrect = selected === correct;
      setQuizAnswered(selected);

      const newProg = recordWordAttempt(
        currentGrade,
        correct,
        isCorrect,
        progressRef.current
      );
      setProgress(newProg);
      progressRef.current = newProg;
      recordPractice();

      let newBest = bestStreakRef.current;
      let newStreak = quizStreak;
      let newScore = quizScore;
      let newBadges = badgesRef.current;

      if (isCorrect) {
        newScore = quizScore + 1;
        newStreak = quizStreak + 1;
        setQuizScore(newScore);
        setQuizStreak(newStreak);
        if (newStreak > newBest) {
          newBest = newStreak;
          setBestStreak(newBest);
          bestStreakRef.current = newBest;
        }
        if (newStreak >= 5) celebrate("\u{1F525}");
        newBadges = checkBadge("first_word", true, newBadges);
        newBadges = checkBadge("streak_5", newStreak >= 5, newBadges);
        newBadges = checkBadge("streak_10", newStreak >= 10, newBadges);
        newBadges = checkBadge("streak_20", newStreak >= 20, newBadges);
      } else {
        newStreak = 0;
        setQuizStreak(0);
      }

      newBadges = checkMasteryBadges(newProg, newBadges);
      setBadges(newBadges);
      badgesRef.current = newBadges;
      doSave({
        words: newProg,
        badges: newBadges,
        bestStreak: newBest,
      });

      const message = getEncouragement(
        isCorrect ? "correct" : "incorrect",
        newStreak
      );
      setQuizFeedback({
        show: true,
        correct: isCorrect,
        message: isCorrect
          ? message
          : `${message} The word was "${correct}"`,
      });

      setTimeout(() => {
        startQuizQuestion(currentGrade, newProg);
      }, isCorrect ? 1500 : 2500);
    },
    [
      quizAnswered,
      quizCorrectWord,
      currentGrade,
      quizStreak,
      quizScore,
      recordWordAttempt,
      recordPractice,
      celebrate,
      checkBadge,
      checkMasteryBadges,
      doSave,
      startQuizQuestion,
    ]
  );

  // ─── Spelling logic ──────────────────────────────────────────────────────

  const startSpellingWord = useCallback(
    (grade: Grade, prog: Record<string, WordProgress>) => {
      const word = getNextWord(grade, prog);
      setSpellingWord(word);
      setSpellingInput("");
      setSpellingDisabled(false);
      setSpellingFeedback({ show: false, correct: false, message: "" });
      setShowHint(false);
      setSpellingInputState("");
      setTimeout(() => {
        speakWord(word);
        spellingInputRef.current?.focus();
      }, 500);
    },
    [getNextWord]
  );

  useEffect(() => {
    if (loaded && currentMode === "spelling") {
      startSpellingWord(currentGrade, progress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMode, currentGrade, loaded]);

  const handleSpellingSubmit = useCallback(() => {
    if (spellingDisabled || !spellingWord) return;
    const userAnswer = spellingInput.trim().toLowerCase();
    const correct = spellingWord.toLowerCase();
    const isCorrect = userAnswer === correct;

    const newProg = recordWordAttempt(
      currentGrade,
      spellingWord,
      isCorrect,
      progressRef.current
    );
    setProgress(newProg);
    progressRef.current = newProg;
    recordPractice();
    setSpellingDisabled(true);

    let newBadges = badgesRef.current;
    let newStreak = spellingStreak;
    let newScore = spellingScore;
    let newSpellingCorrect = spellingCorrectRef.current;

    if (isCorrect) {
      newScore = spellingScore + 1;
      newStreak = spellingStreak + 1;
      newSpellingCorrect = spellingCorrectRef.current + 1;
      setSpellingScore(newScore);
      setSpellingStreak(newStreak);
      setSpellingCorrect(newSpellingCorrect);
      spellingCorrectRef.current = newSpellingCorrect;
      setSpellingInputState("correct");
      celebrate("\u2728");
      newBadges = checkBadge("first_word", true, newBadges);
      newBadges = checkBadge("spelling_5", newSpellingCorrect >= 5, newBadges);
      newBadges = checkBadge(
        "spelling_25",
        newSpellingCorrect >= 25,
        newBadges
      );
    } else {
      newStreak = 0;
      setSpellingStreak(0);
      setSpellingInputState("incorrect");
    }

    newBadges = checkMasteryBadges(newProg, newBadges);
    setBadges(newBadges);
    badgesRef.current = newBadges;
    doSave({
      words: newProg,
      badges: newBadges,
      spellingCorrect: newSpellingCorrect,
    });

    const message = getEncouragement(
      isCorrect ? "correct" : "incorrect",
      newStreak
    );
    setSpellingFeedback({
      show: true,
      correct: isCorrect,
      message: isCorrect
        ? message
        : `${message} The correct spelling is: ${spellingWord}`,
    });

    setTimeout(() => {
      startSpellingWord(currentGrade, newProg);
    }, isCorrect ? 1500 : 3000);
  }, [
    spellingDisabled,
    spellingWord,
    spellingInput,
    currentGrade,
    spellingStreak,
    spellingScore,
    recordWordAttempt,
    recordPractice,
    celebrate,
    checkBadge,
    checkMasteryBadges,
    doSave,
    startSpellingWord,
  ]);

  // ─── Flashcard actions ───────────────────────────────────────────────────

  const markWord = useCallback(
    (knew: boolean) => {
      const word = words[currentWordIndex];
      const newProg = recordWordAttempt(
        currentGrade,
        word,
        knew,
        progressRef.current
      );
      setProgress(newProg);
      progressRef.current = newProg;
      recordPractice();

      let newBadges = badgesRef.current;
      newBadges = checkBadge("first_word", true, newBadges);
      newBadges = checkMasteryBadges(newProg, newBadges);
      setBadges(newBadges);
      badgesRef.current = newBadges;
      doSave({ words: newProg, badges: newBadges });

      if (knew) celebrate("\u2B50");

      // Next word
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
      setIsFlipped(false);
    },
    [
      currentWordIndex,
      words,
      currentGrade,
      recordWordAttempt,
      recordPractice,
      checkBadge,
      checkMasteryBadges,
      doSave,
      celebrate,
    ]
  );

  // ─── Reset ───────────────────────────────────────────────────────────────

  const resetProgress = useCallback(() => {
    if (!window.confirm("Reset all sight word progress? This cannot be undone."))
      return;
    clearProgress("sight_words");
    const wordProgress: Record<string, WordProgress> = {};
    for (const grade of GRADES) {
      for (const word of WORD_LISTS[grade]) {
        wordProgress[`${grade}_${word}`] = {
          history: [],
          lastPracticed: null,
        };
      }
    }
    setProgress(wordProgress);
    progressRef.current = wordProgress;
    setBadges([]);
    badgesRef.current = [];
    setBestStreak(0);
    bestStreakRef.current = 0;
    setDailyStreak(0);
    dailyStreakRef.current = 0;
    setLastPracticeDate(null);
    lastPracticeDateRef.current = null;
    setSpellingCorrect(0);
    spellingCorrectRef.current = 0;
    setCurrentWordIndex(0);
    setIsFlipped(false);
    recentWordsRef.current = [];
  }, []);

  // ─── Render ──────────────────────────────────────────────────────────────

  if (!loaded) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center bg-cream pt-20">
          <div className="text-lg text-text-muted">Loading...</div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <a
            href="/tools"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft size={16} />
            Back to Learning Tools
          </a>

          {/* Header */}
          <div className="clay-card mb-6 overflow-hidden">
            <div className="bg-gradient-to-br from-tool-green to-emerald-600 px-6 py-8 text-center text-white">
              <div className="mb-2 flex items-center justify-center gap-2">
                <BookOpen size={28} />
                <h1 className="font-[family-name:var(--font-varela-round)] text-2xl sm:text-3xl font-bold">
                  Sight Words Flash Cards
                </h1>
              </div>
              <p className="text-sm opacity-90">
                220 Dolch/Fry sight words across Pre-K to 3rd grade
              </p>
            </div>

            <div className="p-4 sm:p-6">
              {/* Grade selector */}
              <div className="mb-5 rounded-xl bg-tool-green/10 p-4 text-center">
                <h3 className="mb-3 text-sm font-semibold text-emerald-800">
                  Choose Grade Level
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {GRADES.map((g) => (
                    <button
                      key={g}
                      onClick={() => switchGrade(g)}
                      className={`min-h-[44px] rounded-full border-2 px-4 py-2.5 text-sm font-semibold transition-all active:scale-95 ${
                        g === currentGrade
                          ? "border-tool-green bg-tool-green text-white"
                          : "border-emerald-200 bg-white text-emerald-800 hover:border-tool-green"
                      }`}
                      aria-selected={g === currentGrade}
                    >
                      {GRADE_NAMES[g]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-5 rounded-xl bg-warm-white p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-text">Progress</h3>
                  <span className="text-xs text-text-muted">
                    {GRADE_NAMES[currentGrade]}: {masteredCount} mastered,{" "}
                    {learningCount} learning,{" "}
                    {words.length - masteredCount - learningCount} to go
                  </span>
                </div>
                <div className="flex h-4 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="bg-success transition-all duration-300"
                    style={{ width: `${masteredPct}%` }}
                  />
                  <div
                    className="bg-amber-400 transition-all duration-300"
                    style={{ width: `${learningPct}%` }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-full bg-success" />
                    Mastered
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-full bg-amber-400" />
                    Learning
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-full bg-gray-200" />
                    Not practiced
                  </span>
                </div>
              </div>

              {/* Mode tabs */}
              <div className="mb-5 flex flex-wrap justify-center gap-2">
                {(
                  [
                    ["flashcards", "Flash Cards"],
                    ["quiz", "Quiz"],
                    ["spelling", "Spelling"],
                  ] as [Mode, string][]
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    onClick={() => switchMode(mode)}
                    className={`min-h-[44px] rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                      mode === currentMode
                        ? "bg-tool-green text-white shadow-md shadow-tool-green/40"
                        : "bg-warm-white text-text hover:bg-beige"
                    }`}
                    aria-selected={mode === currentMode}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* ═══ FLASHCARDS MODE ═══ */}
              {currentMode === "flashcards" && (
                <div className="text-center">
                  {/* Instructions */}
                  <div className="mb-5 rounded-r-lg border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-left text-sm text-amber-800">
                    Tap the card to see it, then tap the speaker to hear it
                    pronounced!
                  </div>

                  {/* Word counter */}
                  <p className="mb-4 text-sm text-text-muted">
                    Word {currentWordIndex + 1} of {words.length}
                  </p>

                  {/* 3D Flip Card */}
                  <div
                    className="mx-auto mb-5 h-[200px] max-w-[320px] cursor-pointer sm:h-[250px] sm:max-w-[400px] md:h-[280px] md:max-w-[450px]"
                    style={{ perspective: "1000px" }}
                    role="button"
                    tabIndex={0}
                    aria-label="Flash card - tap to reveal"
                    onClick={() => setIsFlipped((f) => !f)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setIsFlipped((f) => !f);
                      }
                    }}
                  >
                    <div
                      className="relative h-full w-full transition-transform duration-[600ms]"
                      style={{
                        transformStyle: "preserve-3d",
                        transform: isFlipped ? "rotateY(180deg)" : "none",
                      }}
                    >
                      {/* Front */}
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-[3px] border-dashed border-tool-green bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 shadow-lg"
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        <span className="text-lg font-medium text-emerald-800">
                          Tap to see word
                        </span>
                      </div>
                      {/* Back */}
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-tool-green to-emerald-600 p-5 text-white shadow-lg"
                        style={{
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                        }}
                      >
                        <span className="mb-4 text-5xl font-bold lowercase sm:text-6xl md:text-7xl">
                          {words[currentWordIndex]}
                        </span>
                        <button
                          className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-white/20 text-3xl transition-all hover:scale-110 hover:bg-white/30"
                          aria-label="Hear word pronounced"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakWord(words[currentWordIndex]);
                          }}
                        >
                          <Volume2 size={28} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="mb-5 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => {
                        setCurrentWordIndex(
                          (prev) => (prev - 1 + words.length) % words.length
                        );
                        setIsFlipped(false);
                      }}
                      className="flex min-h-[48px] items-center gap-1 rounded-full border-2 border-gray-200 bg-white px-5 py-3 text-sm font-semibold transition-all active:scale-95"
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>
                    <button
                      onClick={() => markWord(true)}
                      className="flex min-h-[48px] items-center gap-1 rounded-full border-2 border-green-500 bg-green-50 px-5 py-3 text-sm font-semibold text-green-800 transition-all hover:bg-green-500 hover:text-white active:scale-95"
                    >
                      <Check size={16} /> I Knew It!
                    </button>
                    <button
                      onClick={() => markWord(false)}
                      className="flex min-h-[48px] items-center gap-1 rounded-full border-2 border-amber-400 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-800 transition-all hover:bg-amber-400 hover:text-white active:scale-95"
                    >
                      <BookOpen size={14} /> Still Learning
                    </button>
                    <button
                      onClick={() => {
                        setCurrentWordIndex(
                          (prev) => (prev + 1) % words.length
                        );
                        setIsFlipped(false);
                      }}
                      className="flex min-h-[48px] items-center gap-1 rounded-full border-2 border-gray-200 bg-white px-5 py-3 text-sm font-semibold transition-all active:scale-95"
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Word list toggle */}
                  <div className="mb-4">
                    <button
                      onClick={() => setShowWordList((s) => !s)}
                      className="inline-flex min-h-[44px] items-center gap-1 rounded-full bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200"
                    >
                      <List size={16} />
                      {showWordList ? "Hide Word List" : "View All Words"}
                    </button>
                  </div>

                  {showWordList && (
                    <div className="rounded-xl bg-warm-white p-4">
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2">
                        {words.map((word, index) => {
                          const key = `${currentGrade}_${word}`;
                          const mastery: MasteryLevel = calculateMastery(
                            progress[key]?.history ?? []
                          );
                          return (
                            <button
                              key={word}
                              onClick={() => {
                                setCurrentWordIndex(index);
                                setIsFlipped(false);
                                setShowWordList(false);
                              }}
                              className={`rounded-lg border-2 px-3 py-2.5 text-sm font-semibold lowercase transition-all active:scale-95 ${
                                mastery === "mastered"
                                  ? "border-green-500 bg-green-50 text-green-800"
                                  : mastery === "learning"
                                  ? "border-amber-400 bg-amber-50 text-amber-800"
                                  : "border-gray-200 bg-white text-gray-700"
                              }`}
                              aria-label={`${word}, ${mastery}`}
                            >
                              {word}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Badges section */}
                  <div className="mt-6 rounded-xl bg-warm-white p-4">
                    <h4 className="mb-3 text-center text-sm font-semibold text-text">
                      <Trophy
                        size={16}
                        className="mr-1 inline text-tool-green"
                      />
                      Badges
                    </h4>
                    <div className="flex flex-wrap justify-center gap-2.5">
                      {Object.entries(BADGES).map(([id, badge]) => {
                        const earned = badges.includes(id);
                        return (
                          <div
                            key={id}
                            title={badge.desc}
                            className={`flex min-w-[75px] flex-col items-center rounded-xl p-2.5 transition-transform hover:scale-105 ${
                              earned
                                ? "bg-gradient-to-br from-emerald-100 to-emerald-200"
                                : "bg-gray-50 opacity-50"
                            }`}
                          >
                            <span className="mb-1 text-2xl">
                              {earned ? badge.icon : "\u{1F512}"}
                            </span>
                            <span className="text-center text-[0.65rem] leading-tight text-gray-700">
                              {badge.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ QUIZ MODE ═══ */}
              {currentMode === "quiz" && (
                <div className="text-center py-5">
                  {/* Stats */}
                  <div className="mb-6 flex flex-wrap justify-center gap-4">
                    <div className="inline-block rounded-xl bg-warm-white px-6 py-3 text-center">
                      <span className="block text-xs text-text-muted">
                        Score
                      </span>
                      <span className="text-3xl font-bold text-tool-green">
                        {quizScore}
                      </span>
                    </div>
                    <div className="inline-block rounded-xl bg-warm-white px-6 py-3 text-center">
                      <span className="block text-xs text-text-muted">
                        Streak
                      </span>
                      <span className="flex items-center justify-center gap-1 text-3xl font-bold text-tool-green">
                        {quizStreak > 0 && <Flame size={20} className="text-orange-500" />}
                        {quizStreak}
                      </span>
                    </div>
                    <div className="inline-block rounded-xl bg-warm-white px-6 py-3 text-center">
                      <span className="block text-xs text-text-muted">
                        Best
                      </span>
                      <span className="flex items-center justify-center gap-1 text-3xl font-bold text-tool-green">
                        <Star size={18} className="text-amber-400" />
                        {bestStreak}
                      </span>
                    </div>
                  </div>

                  {/* Prompt */}
                  <div className="mb-6">
                    <p className="mb-4 text-text-muted">
                      Listen to the word and tap the correct one!
                    </p>
                    <button
                      onClick={() => speakWord(quizWord)}
                      className="inline-flex min-h-[60px] items-center gap-2 rounded-full bg-gradient-to-br from-tool-green to-emerald-600 px-6 py-3 text-lg font-semibold text-white shadow-md shadow-tool-green/40 transition-all hover:scale-105 active:scale-95"
                      aria-label="Hear the word"
                    >
                      <Volume2 size={22} /> Hear Word
                    </button>
                  </div>

                  {/* Options */}
                  <div className="mx-auto grid max-w-[400px] grid-cols-2 gap-3 sm:max-w-[500px] sm:gap-4">
                    {quizOptions.map((opt) => {
                      let btnClass =
                        "min-h-[70px] sm:min-h-[80px] md:min-h-[90px] rounded-2xl border-[3px] bg-white text-2xl sm:text-3xl font-bold lowercase transition-all cursor-pointer";
                      if (quizAnswered) {
                        if (opt === quizCorrectWord) {
                          btnClass += " border-green-500 bg-green-50 text-green-800";
                        } else if (
                          opt === quizAnswered &&
                          opt !== quizCorrectWord
                        ) {
                          btnClass += " border-red-500 bg-red-50 text-red-800";
                        } else {
                          btnClass += " border-gray-200 opacity-60";
                        }
                      } else {
                        btnClass +=
                          " border-gray-200 hover:border-tool-green active:scale-95";
                      }
                      return (
                        <button
                          key={opt}
                          onClick={() => handleQuizAnswer(opt)}
                          disabled={!!quizAnswered}
                          className={btnClass}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback */}
                  {quizFeedback.show && (
                    <div
                      className={`mt-4 animate-[fadeIn_0.3s_ease] rounded-xl p-4 text-lg font-semibold ${
                        quizFeedback.correct
                          ? "bg-green-50 text-green-800"
                          : "bg-red-50 text-red-800"
                      }`}
                    >
                      {quizFeedback.message}
                    </div>
                  )}
                </div>
              )}

              {/* ═══ SPELLING MODE ═══ */}
              {currentMode === "spelling" && (
                <div className="py-5 text-center">
                  {/* Stats */}
                  <div className="mb-6 flex flex-wrap justify-center gap-4">
                    <div className="inline-block rounded-xl bg-warm-white px-6 py-3 text-center">
                      <span className="block text-xs text-text-muted">
                        Score
                      </span>
                      <span className="text-3xl font-bold text-tool-green">
                        {spellingScore}
                      </span>
                    </div>
                    <div className="inline-block rounded-xl bg-warm-white px-6 py-3 text-center">
                      <span className="block text-xs text-text-muted">
                        Streak
                      </span>
                      <span className="text-3xl font-bold text-tool-green">
                        {spellingStreak}
                      </span>
                    </div>
                  </div>

                  {/* Prompt */}
                  <div className="mb-6">
                    <p className="mb-4 text-text-muted">
                      Listen to the word and type it!
                    </p>
                    <button
                      onClick={() => speakWord(spellingWord)}
                      className="inline-flex min-h-[60px] items-center gap-2 rounded-full bg-gradient-to-br from-tool-green to-emerald-600 px-6 py-3 text-lg font-semibold text-white shadow-md shadow-tool-green/40 transition-all hover:scale-105 active:scale-95"
                      aria-label="Hear the word"
                    >
                      <Volume2 size={22} /> Hear Word
                    </button>
                  </div>

                  {/* Input */}
                  <div className="mb-5 flex flex-col items-center gap-4">
                    <input
                      ref={spellingInputRef}
                      type="text"
                      value={spellingInput}
                      onChange={(e) => setSpellingInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSpellingSubmit();
                      }}
                      disabled={spellingDisabled}
                      autoComplete="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder="Type the word here"
                      aria-label="Type the word you hear"
                      className={`w-full max-w-[300px] rounded-2xl border-4 px-5 py-4 text-center text-2xl font-semibold lowercase outline-none transition-all ${
                        spellingInputState === "correct"
                          ? "border-green-500 bg-green-50"
                          : spellingInputState === "incorrect"
                          ? "animate-[shake_0.5s_ease] border-red-500 bg-red-50"
                          : "border-gray-200 focus:border-tool-green focus:ring-4 focus:ring-tool-green/20"
                      }`}
                    />
                    <button
                      onClick={handleSpellingSubmit}
                      disabled={spellingDisabled}
                      className="min-h-[56px] rounded-full bg-gradient-to-br from-tool-green to-emerald-600 px-10 py-4 text-lg font-bold text-white shadow-md shadow-tool-green/40 transition-all active:scale-95 disabled:opacity-50"
                    >
                      Check
                    </button>
                  </div>

                  {/* Feedback */}
                  {spellingFeedback.show && (
                    <div
                      className={`mb-4 animate-[fadeIn_0.3s_ease] rounded-xl p-4 text-lg font-semibold ${
                        spellingFeedback.correct
                          ? "bg-green-50 text-green-800"
                          : "bg-red-50 text-red-800"
                      }`}
                    >
                      {spellingFeedback.message}
                    </div>
                  )}

                  {/* Hint */}
                  {!spellingDisabled && (
                    <div className="mt-4">
                      <button
                        onClick={() => setShowHint(true)}
                        className="inline-flex min-h-[44px] items-center gap-1 rounded-full bg-amber-50 px-5 py-2.5 text-sm font-medium text-amber-800 transition-all hover:bg-amber-100"
                      >
                        <Lightbulb size={16} /> Show Hint
                      </button>
                      {showHint && (
                        <div className="mt-3 text-2xl font-bold tracking-[4px] text-text-muted">
                          {spellingWord[0]}
                          {" _ ".repeat(spellingWord.length - 1)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Reset button */}
              <div className="mt-6 text-center">
                <button
                  onClick={resetProgress}
                  className="inline-flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-error"
                >
                  <RotateCcw size={12} /> Reset Progress
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Celebration overlay ─── */}
        {celebration && (
          <div
            className="pointer-events-none fixed inset-0 z-[1000] flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="animate-[celebrate_1s_ease-out_forwards] text-7xl">
              {celebration}
            </span>
          </div>
        )}

        {/* ─── Badge notification ─── */}
        {badgeNotification && (
          <div className="fixed top-5 left-1/2 z-[1000] -translate-x-1/2 animate-[slideDown_0.5s_ease] rounded-xl bg-gradient-to-br from-tool-green to-emerald-600 px-6 py-4 text-center text-white shadow-lg shadow-tool-green/40">
            <div className="mb-1 text-3xl">{badgeNotification.icon}</div>
            <div className="font-semibold">Badge Earned!</div>
            <div className="text-sm opacity-90">{badgeNotification.name}</div>
          </div>
        )}
      </main>
      <Footer />

      {/* Keyframe animations injected via style tag */}
      <style jsx global>{`
        @keyframes celebrate {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          50% {
            transform: scale(1.5);
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
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
