/**
 * Icon
 * Stroke icons drawn with currentColor, so they take the text color. Never emoji.
 * Decorative by default (aria-hidden); pass `label` when the icon is the only content.
 *
 * Props: name, size (px), label
 */
const PATHS = {
  home: 'M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M16 3a4 4 0 0 1 0 8M18 14a6 6 0 0 1 4 7',
  dumbbell: 'M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12',
  card: 'M3 6h18v13H3zM3 10h18M7 15h4',
  bag: 'M5 8h14l-1 12H6zM9 8a3 3 0 0 1 6 0',
  tag: 'M3 12V4h8l10 10-8 8zM7.5 7.5h.01',
  door: 'M5 21V4h10v17M15 12h.01M19 21H3',
  list: 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
  check: 'M5 12l5 5L19 7',
  x: 'M6 6l12 12M18 6L6 18',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 11v6M12 7.5h.01',
  alert: 'M12 3l10 18H2zM12 10v4M12 17.5h.01',
  menu: 'M4 7h16M4 12h16M4 17h16',
  chevronLeft: 'M15 6l-6 6 6 6',
  chevronRight: 'M9 6l6 6-6 6',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 7v5l3 2',
}

/** Every available icon name, for the sandbox page. */
export const ICON_NAMES = Object.keys(PATHS)

export default function Icon({ name, size = 20, label }) {
  const d = PATHS[name]
  if (!d) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path d={d} />
    </svg>
  )
}
