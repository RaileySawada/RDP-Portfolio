import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, isReady: boolean, duration = 650) {
  const [displayValue, setDisplayValue] = useState(0);
  const currentValue = useRef(0);

  useEffect(() => {
    if (!isReady) {
      currentValue.current = 0;
      setDisplayValue(0);
      return;
    }

    const safeTarget = Math.max(Math.round(target), 0);
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || safeTarget === currentValue.current) {
      currentValue.current = safeTarget;
      setDisplayValue(safeTarget);
      return;
    }

    const startValue = currentValue.current;
    const difference = safeTarget - startValue;
    const startTime = performance.now();
    let animationFrame = 0;

    const updateValue = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const nextValue = Math.round(startValue + difference * easedProgress);

      currentValue.current = nextValue;
      setDisplayValue(nextValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateValue);
      }
    };

    animationFrame = requestAnimationFrame(updateValue);
    return () => cancelAnimationFrame(animationFrame);
  }, [duration, isReady, target]);

  return displayValue;
}
