import { useEffect, useState } from "react";
import { heroWords } from "../lib/content";

const TYPE_SPEED = 95;
const DELETE_SPEED = 58;
const HOLD_DELAY = 950;
const SWITCH_DELAY = 220;

export default function HeroWord() {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = heroWords[wordIndex];

    const timeout = window.setTimeout(
      () => {
        if (!isDeleting && displayText.length < currentWord.length) {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
          return;
        }

        if (!isDeleting && displayText.length === currentWord.length) {
          setIsDeleting(true);
          return;
        }

        if (isDeleting && displayText.length > 0) {
          setDisplayText(currentWord.slice(0, displayText.length - 1));
          return;
        }

        setIsDeleting(false);
        setWordIndex((current) => (current + 1) % heroWords.length);
      },
      !isDeleting && displayText.length === currentWord.length
        ? HOLD_DELAY
        : isDeleting && displayText.length === 0
          ? SWITCH_DELAY
          : isDeleting
            ? DELETE_SPEED
            : TYPE_SPEED,
    );

    return () => window.clearTimeout(timeout);
  }, [displayText, isDeleting, wordIndex]);

  return (
    <span className="typewriter" aria-live="polite" aria-label={heroWords[wordIndex]}>
      <span className="typed-word">{displayText}</span>
      <span className="cursor" aria-hidden="true" />
    </span>
  );
}
