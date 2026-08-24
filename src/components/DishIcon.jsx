// Simple, geometric SVG illustrations per street-food category, drawn in our
// own brand palette. Not real vendor photos (the backend has no image
// storage yet) -- an intentional illustration system instead of faking
// photos we don't have.

const CATEGORIES = [
  {
    key: "chaat",
    match: /samosa|chaat|puri|bhel|tikki|pakora|vada/i,
    bg: "var(--color-marigold-500)",
    icon: (
        <path d="M12 34 L32 34 L27 14 Q24 8 21 14 Z" fill="currentColor" />
    ),
  },
  {
    key: "roll",
    match: /roll|wrap|frankie|kathi|paratha/i,
    bg: "var(--color-chili-500)",
    icon: (
        <path
            d="M10 22c0-6 6-10 14-10s14 4 14 10-6 10-14 10-14-4-14-10z"
            fill="currentColor"
        />
    ),
  },
  {
    key: "momo",
    match: /momo|dumpling|gyoza/i,
    bg: "var(--color-paper-100)",
    icon: (
        <>
          <path d="M22 10c8 0 14 5 14 12s-6 10-14 10S8 29 8 22 14 10 22 10z" fill="currentColor" />
          <path d="M22 10c2 4 2 8 0 12M22 10c-2 4-2 8 0 12" stroke="var(--color-dusk-900)" strokeWidth="1.2" fill="none" opacity="0.35" />
        </>
    ),
  },
  {
    key: "beverage",
    match: /chai|tea|coffee|juice|lassi|shake|drink|nimbu|soda/i,
    bg: "var(--color-mint-500)",
    icon: (
        <path d="M14 10h16l-2 20a4 4 0 01-4 3h-4a4 4 0 01-4-3z" fill="currentColor" />
    ),
  },
  {
    key: "sweet",
    match: /laddoo|jalebi|sweet|kulfi|barfi|halwa|rasgulla|gulab/i,
    bg: "var(--color-marigold-400)",
    icon: <circle cx="22" cy="22" r="12" fill="currentColor" />,
  },
  {
    key: "grill",
    match: /tikka|kebab|skewer|grill|tandoor|seekh/i,
    bg: "var(--color-chili-600)",
    icon: (
        <path
            d="M8 22h28M14 16l4 6-4 6M22 16l4 6-4 6M30 16l4 6-4 6"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
        />
    ),
  },
  {
    key: "default",
    match: /.*/,
    bg: "var(--color-dusk-600)",
    icon: (
        <path
            d="M22 10c7 0 12 5 12 12s-5 12-12 12-12-5-12-12 5-12 12-12z"
            fill="currentColor"
        />
    ),
  },
];

export function categorize(name) {
  return CATEGORIES.find((c) => c.match.test(name)) || CATEGORIES[CATEGORIES.length - 1];
}

export default function DishIcon({ name, imageUrl, size = 56, className = "" }) {
  if (imageUrl) {
    return (
        <img
            src={imageUrl}
            alt={name}
            style={{ width: size, height: size }}
            className={`shrink-0 rounded-2xl object-cover ${className}`}
        />
    );
  }

  const category = categorize(name);
  return (
      <div
          className={`flex shrink-0 items-center justify-center rounded-2xl ${className}`}
          style={{
            width: size,
            height: size,
            background: `color-mix(in oklab, ${category.bg} 22%, var(--color-dusk-900))`,
            color: category.bg,
          }}
          aria-hidden="true"
      >
        <svg viewBox="0 0 44 44" width={size * 0.6} height={size * 0.6}>
          {category.icon}
        </svg>
      </div>
  );
}