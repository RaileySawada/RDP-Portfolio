type IconProps = {
  className?: string;
};

export function BrandIcon({ className = "h-9 w-9" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" className="fill-neutral-950 dark:fill-white" />
      <path
        d="M18 44V18h15.2c6.1 0 10.1 3.6 10.1 9.1 0 3.8-2 6.8-5.2 8.2L46 44h-8.6l-6.8-7.7h-4.7V44H18Zm7.9-14.1h6.4c2 0 3.2-1 3.2-2.8s-1.2-2.8-3.2-2.8h-6.4v5.6Z"
        className="fill-white dark:fill-neutral-950"
      />
      <path d="M46.5 18h-6.7l6.8 7.5L53 18h-6.5Z" className="fill-cyan-400" />
    </svg>
  );
}

export function MenuIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M7 17 17 7M8 7h9v9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SunIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" />
    </svg>
  );
}

export function MoonIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MonitorIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" strokeLinecap="round" />
    </svg>
  );
}

export function MailIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 6h16v12H4z" strokeLinejoin="round" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SystemIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="4" width="18" height="6" rx="1.5" />
      <rect x="3" y="14" width="18" height="6" rx="1.5" />
      <path d="M7 7h.01M7 17h.01" strokeLinecap="round" />
    </svg>
  );
}

export function DocsIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M7 3h7l4 4v14H7z" strokeLinejoin="round" />
      <path d="M14 3v4h4M9.5 12h5M9.5 15.5h5M9.5 8.5h2" strokeLinecap="round" />
    </svg>
  );
}

export function AutomationIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="6" cy="7" r="2.4" />
      <circle cx="18" cy="17" r="2.4" />
      <path d="M8.1 8.4 15.9 15.6M6 9.4V16a2 2 0 0 0 2 2h2" strokeLinecap="round" />
    </svg>
  );
}

export function WebIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="M3 9h18M6.5 7h.01" strokeLinecap="round" />
    </svg>
  );
}

export function BarChartIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 19V5M4 19h16" strokeLinecap="round" />
      <rect x="7" y="11" width="3" height="5" rx="1" />
      <rect x="12" y="8" width="3" height="8" rx="1" />
      <rect x="17" y="6" width="3" height="10" rx="1" />
    </svg>
  );
}

export function EditIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4Z" strokeLinejoin="round" />
      <path d="m13.5 6.5 4 4" strokeLinecap="round" />
    </svg>
  );
}

export function EyeIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function ExternalLinkIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M14 4h6v6M20 4l-9 9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LogOutIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" strokeLinecap="round" />
      <path d="M14 8l4 4-4 4M18 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GridIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

export function LayersIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </svg>
  );
}

export function UserIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.5-4 4-6 7-6s5.5 2 7 6" strokeLinecap="round" />
    </svg>
  );
}

export function SealIcon({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4" aria-hidden="true">
      <circle cx="24" cy="18" r="11" />
      <path d="m18.5 18 3.8 3.8L29.5 14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m16 27.5-4.2 13.5 8-4.3 4.2 6 4-6 8 4.3-4.2-13.5" strokeLinejoin="round" />
    </svg>
  );
}

export function TrashIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 7h16M9 7V4.8c0-.4.4-.8.9-.8h4.2c.5 0 .9.4.9.8V7M18.5 7l-.7 12.2c0 .9-.8 1.6-1.7 1.6H8c-.9 0-1.7-.7-1.7-1.6L5.5 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" strokeLinecap="round" />
    </svg>
  );
}

export function UploadIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 15V4M8 8l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ImageIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="10" r="1.75" />
      <path d="m4.5 17.5 5-5 3.5 3.5 2-2 4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlusIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

export function AlertIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 3.5 21.5 20h-19L12 3.5Z" strokeLinejoin="round" />
      <path d="M12 10v4.2M12 17.3h.01" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyStateIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
      <path d="M4.5 5.5v5c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-5M4.5 10.5v5c0 1.7 3.4 3 7.5 3 1.1 0 2.1-.1 3-.3" strokeLinecap="round" />
      <path d="m17 16 4 4m0-4-4 4" strokeLinecap="round" />
    </svg>
  );
}

export function SparkIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" strokeLinecap="round" />
    </svg>
  );
}

export function SocialIcon({ label, className = "h-4 w-4" }: IconProps & { label: string }) {
  if (label === "GitHub") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 .8a11.2 11.2 0 0 0-3.5 21.8c.6.1.8-.2.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 .1.7 2.5 3.4 1.8.1-.8.4-1.3.7-1.6-2.6-.3-5.4-1.3-5.4-5.6 0-1.2.4-2.2 1.2-3-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a10.8 10.8 0 0 1 5.8 0C17.1 5.6 18 5.9 18 5.9c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3 0 4.4-2.8 5.3-5.4 5.6.4.4.8 1.1.8 2.2V22c0 .4.2.7.8.6A11.2 11.2 0 0 0 12 .8Z" />
      </svg>
    );
  }

  if (label === "LinkedIn") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M5 3.5A2.5 2.5 0 1 1 5 8.6a2.5 2.5 0 0 1 0-5.1ZM3 10h4v11H3V10Zm6.3 0h3.8v1.5h.1c.5-.9 1.8-1.9 3.7-1.9 3.9 0 4.6 2.5 4.6 5.8V21h-4v-5c0-1.2 0-2.8-1.8-2.8s-2 1.3-2 2.7V21h-4.4V10Z" />
      </svg>
    );
  }

  if (label === "X") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M14.2 10.3 22.5 1h-2l-7.2 8.1L7.6 1H1l8.7 12.3L1 23h2l7.6-8.5 6.1 8.5H23l-8.8-12.7Zm-2.7 3-1-1.4-7-9.4h3.1l5.6 7.6 1 1.4 7.4 10h-3.1l-6-8.2Z" />
      </svg>
    );
  }

  if (label === "Portfolio" || label === "Resume") {
    return <ExternalLinkIcon className={className} />;
  }

  if (label === "Phone") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M7 4h3l1.5 4-2 1.2c1 2.2 2.1 3.7 4.3 4.8l1.2-2h4l1 3c.2.8-.1 1.6-.8 2.1-1 .7-2.1 1-3.4.9C10 17.4 6.6 14 5.1 8.2 4.8 7 5.1 5.9 5.8 4.9 6.1 4.4 6.5 4 7 4Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (label === "Facebook") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M14 8.2V6.8c0-.7.5-1.1 1.2-1.1H17V2.3c-.7-.1-1.6-.2-2.6-.2-2.6 0-4.4 1.6-4.4 4.4v1.7H7v3.7h3V22h4v-10.1h2.8l.5-3.7H14Z" />
      </svg>
    );
  }

  if (label === "Instagram") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <circle cx="12" cy="12" r="3.5" />
        <path d="M17 7.2h.01" strokeLinecap="round" />
      </svg>
    );
  }

  if (label === "YouTube") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M21.5 7.2c-.2-1-.9-1.7-1.9-1.9C18 5 12 5 12 5s-6 0-7.6.3c-1 .2-1.7.9-1.9 1.9C2.2 8.9 2.2 12 2.2 12s0 3.1.3 4.8c.2 1 .9 1.7 1.9 1.9C6 19 12 19 12 19s6 0 7.6-.3c1-.2 1.7-.9 1.9-1.9.3-1.7.3-4.8.3-4.8s0-3.1-.3-4.8ZM10 15.1V8.9l5.2 3.1-5.2 3.1Z" />
      </svg>
    );
  }

  if (label === "TikTok") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M15.7 3c.4 2.5 1.8 4 4.3 4.2v3.4c-1.6 0-3.1-.5-4.3-1.4v5.8c0 3.4-2.3 5.7-5.6 5.7-3 0-5.1-2-5.1-4.8 0-3.1 2.4-5 5.7-5 .4 0 .7 0 1 .1v3.5c-.3-.1-.7-.2-1.1-.2-1.2 0-2 .6-2 1.6 0 1 .7 1.6 1.7 1.6 1.1 0 1.8-.7 1.8-2.1V3h3.6Z" />
      </svg>
    );
  }

  if (label === "Discord") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.8 5.5A15 15 0 0 0 15.2 4l-.4.8a13 13 0 0 1 3.2 1.6 11.2 11.2 0 0 0-9.9 0 13 13 0 0 1 3.2-1.6L10.8 4a15 15 0 0 0-3.6 1.5C4.9 8.9 4.3 12.1 4.6 15.3A14.6 14.6 0 0 0 9 17.5l.9-1.2c-.5-.2-1-.4-1.4-.7l.3-.2a10.2 10.2 0 0 0 6.4 0l.3.2c-.5.3-.9.5-1.4.7l.9 1.2a14.6 14.6 0 0 0 4.4-2.2c.4-3.7-.6-6.8-2.6-9.8ZM9.6 13.8c-.8 0-1.4-.7-1.4-1.5s.6-1.5 1.4-1.5 1.4.7 1.4 1.5-.6 1.5-1.4 1.5Zm4.8 0c-.8 0-1.4-.7-1.4-1.5s.6-1.5 1.4-1.5 1.4.7 1.4 1.5-.6 1.5-1.4 1.5Z" />
      </svg>
    );
  }

  return <MailIcon className={className} />;
}
