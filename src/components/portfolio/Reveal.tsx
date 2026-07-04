import type { ReactNode } from "react";
import { useInView } from "../../hooks/useInView";

type RevealProps = {
  as?: "div" | "article";
  className?: string;
  delay?: number;
  children: ReactNode;
};

export function Reveal({ as: Element = "div", className = "", delay = 0, children }: RevealProps) {
  const { ref, isInView } = useInView<HTMLDivElement>();

  return (
    <Element className={`home-reveal ${isInView ? "is-visible" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }} ref={ref}>
      {children}
    </Element>
  );
}
