"use client";

import { useState, useEffect, useCallback } from "react";
import { Volume2, BookOpen } from "lucide-react";

interface WordEntry {
  word: string;
  definition: string;
  partOfSpeech: string;
  videoId: string;
  series: "wots" | "wotw";
}

// Exact video data from the original portfolio/public/js/word-of-day.js
const WORDS: WordEntry[] = [
  // Sesame Street — Word on the Street
  { word: "Adventure", definition: "An exciting experience where you explore something new.", partOfSpeech: "noun", videoId: "zVHZDh_Tq7A", series: "wots" },
  { word: "Inflate", definition: "To fill something with air so it gets bigger.", partOfSpeech: "verb", videoId: "Y9SYE21X0pQ", series: "wots" },
  { word: "Respect", definition: "Treating others the way you want to be treated.", partOfSpeech: "noun", videoId: "GOzrAK4gOSo", series: "wots" },
  { word: "Reinforce", definition: "To make something stronger or more supported.", partOfSpeech: "verb", videoId: "0snQnsxXRQE", series: "wots" },
  { word: "Amplify", definition: "To make something louder or bigger.", partOfSpeech: "verb", videoId: "q9TMEVvjYb8", series: "wots" },
  { word: "Attach", definition: "To connect or join one thing to another.", partOfSpeech: "verb", videoId: "SjErw7D56Hs", series: "wots" },
  { word: "Splatter", definition: "To splash or scatter something messily.", partOfSpeech: "verb", videoId: "OAh24gAI9jM", series: "wots" },
  { word: "Absorb", definition: "To soak up or take in liquid or information.", partOfSpeech: "verb", videoId: "2nYm92sLtaI", series: "wots" },
  { word: "Sturdy", definition: "Strong and well-built, not easy to break.", partOfSpeech: "adjective", videoId: "AvHKCiF-h2I", series: "wots" },
  { word: "Reporter", definition: "A person who finds out news and tells others about it.", partOfSpeech: "noun", videoId: "XFWThK_H6O8", series: "wots" },
  { word: "Strategy", definition: "A plan you make to reach a goal or solve a problem.", partOfSpeech: "noun", videoId: "Ym-w8J4PHZw", series: "wots" },
  { word: "Confidence", definition: "Believing in yourself and what you can do.", partOfSpeech: "noun", videoId: "ctNg0DgMa-o", series: "wots" },
  { word: "Courteous", definition: "Being polite and showing good manners.", partOfSpeech: "adjective", videoId: "lpMfYtd5IZs", series: "wots" },
  { word: "Cheer", definition: "To shout happily to encourage someone.", partOfSpeech: "verb", videoId: "NLaqKxfxp64", series: "wots" },
  { word: "Soggy", definition: "Very wet and soft, soaked through.", partOfSpeech: "adjective", videoId: "RAIjSlwHgbU", series: "wots" },
  { word: "Imagination", definition: "The ability to create pictures and ideas in your mind.", partOfSpeech: "noun", videoId: "xYSLo7eVLDQ", series: "wots" },
  { word: "Translate", definition: "To change words from one language to another.", partOfSpeech: "verb", videoId: "DPMVI4jFMaA", series: "wots" },
  { word: "Author", definition: "A person who writes stories or books.", partOfSpeech: "noun", videoId: "gECUFhqoULI", series: "wots" },
  { word: "Vocabulary", definition: "All the words you know and use.", partOfSpeech: "noun", videoId: "ku-8-mFUszI", series: "wots" },
  { word: "Subtraction", definition: "Taking one number away from another.", partOfSpeech: "noun", videoId: "ddufPApUYxY", series: "wots" },
  // PBS Kids — Word of the Week
  { word: "Autumn", definition: "The season when leaves change color and fall from trees.", partOfSpeech: "noun", videoId: "04JBdu_Ekt0", series: "wotw" },
  { word: "Distant", definition: "Far away from where you are.", partOfSpeech: "adjective", videoId: "U71pT4KNJaE", series: "wotw" },
  { word: "Hollow", definition: "Empty on the inside, like a tube or a cave.", partOfSpeech: "adjective", videoId: "1G7aED7zy14", series: "wotw" },
  { word: "Invierno", definition: "The Spanish word for winter, the coldest season.", partOfSpeech: "noun", videoId: "nVi3C9XiHn4", series: "wotw" },
  { word: "Feliz", definition: "The Spanish word for happy, feeling joyful.", partOfSpeech: "adjective", videoId: "T7LVqPMeOxs", series: "wotw" },
];

function getTodaysWord(): WordEntry {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return WORDS[dayOfYear % WORDS.length];
}

export default function WordOfDay() {
  const [entry, setEntry] = useState<WordEntry | null>(null);

  useEffect(() => {
    setEntry(getTodaysWord());
  }, []);

  const speakWord = useCallback(() => {
    if (!entry) return;
    const utterance = new SpeechSynthesisUtterance(entry.word);
    utterance.rate = 0.7;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }, [entry]);

  if (!entry) return null;

  const seriesLabel =
    entry.series === "wots"
      ? "Sesame Street: Word on the Street"
      : "PBS Kids: Word of the Week";

  return (
    <section id="word-of-day" className="bg-warm-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="mb-2 text-center font-[family-name:var(--font-caveat)] text-2xl text-terracotta">
          Learn something new
        </p>
        <h2 className="mb-12 text-center font-[family-name:var(--font-varela-round)] text-3xl text-text sm:text-4xl">
          Word of the Day
        </h2>

        <div className="mx-auto max-w-3xl">
          <div className="clay-card overflow-hidden">
            {/* Video */}
            <div className="relative aspect-video w-full">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube.com/embed/${entry.videoId}?rel=0&modestbranding=1&autoplay=0`}
                title={`${entry.word} — ${seriesLabel}`}
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Word info */}
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-[family-name:var(--font-varela-round)] text-3xl text-primary sm:text-4xl">
                  {entry.word}
                </h3>
                <button
                  onClick={speakWord}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
                  aria-label={`Hear pronunciation of ${entry.word}`}
                >
                  <Volume2 size={20} />
                </button>
                <span className="rounded-full bg-accent/15 px-3 py-1 text-sm font-semibold text-accent-dark">
                  {entry.partOfSpeech}
                </span>
              </div>
              <p className="mt-3 text-lg text-text-muted">{entry.definition}</p>
              <div className="mt-4 flex items-center gap-2 text-sm text-text-light">
                <BookOpen size={16} />
                <span>{seriesLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
