import type { MouseEvent } from "react";
import type { ThemePreference } from "../../hooks/useTheme";
import { MonitorIcon, MoonIcon, SunIcon } from "../ui/Icons";

type ThemeToggleProps = {
  selectedTheme: ThemePreference;
  onSelectTheme: (theme: ThemePreference, originElement: HTMLElement) => void;
};

const themeOptions: { label: string; value: ThemePreference; icon: typeof MonitorIcon }[] = [
  { label: "System theme", value: "system", icon: MonitorIcon },
  { label: "Light theme", value: "light", icon: SunIcon },
  { label: "Dark theme", value: "dark", icon: MoonIcon },
];

export function ThemeToggle({ selectedTheme, onSelectTheme }: ThemeToggleProps) {
  const handleSelect = (theme: ThemePreference) => (event: MouseEvent<HTMLButtonElement>) => {
    onSelectTheme(theme, event.currentTarget);
  };

  return (
    <div className="theme-toggle" role="radiogroup" aria-label="Theme selection">
      <span className={`toggle-knob is-${selectedTheme}`} aria-hidden="true" />
      {themeOptions.map((option) => {
        const Icon = option.icon;
        const isSelected = selectedTheme === option.value;

        return (
          <button
            className={`toggle-option ${isSelected ? "is-active" : ""}`}
            type="button"
            role="radio"
            aria-label={option.label}
            aria-checked={isSelected}
            key={option.value}
            onClick={handleSelect(option.value)}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}
