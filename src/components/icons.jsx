// Inline SVG icons — currentColor-driven, sized via width/height props.
const base = (props) => ({
  width: props.size || 20,
  height: props.size || 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
});

export const PlaneLogo = (p) => (
  <svg {...base(p)}>
    <path d="M2 12c3-1 6-1 9-4 2-2 4-4 6-4 1 0 1 1 0 2-2 2-4 4-4 6 3 3 3 6 2 9-1-3-2-4-4-5-2 3-4 5-6 7-1 1-2 0-1-1 2-2 4-4 5-7-2-1-4-1-8-2 0 0 0-1 1-1z" fill="currentColor" stroke="none" />
  </svg>
);

export const Ticket = (p) => (
  <svg {...base(p)}>
    <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" />
    <path d="M15 6v12" strokeDasharray="2 2" />
  </svg>
);

export const Headset = (p) => (
  <svg {...base(p)}>
    <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
    <rect x="3" y="13" width="4" height="6" rx="1.5" />
    <rect x="17" y="13" width="4" height="6" rx="1.5" />
    <path d="M20 19a4 4 0 0 1-4 3h-3" />
  </svg>
);

export const PlaneDepart = (p) => (
  <svg {...base(p)}>
    <path d="M3 20h18" />
    <path d="M4.5 14.5 8 15l6-6 3.5 1.2c1 .3 1 1.6-.1 1.9l-11 3c-.7.2-1.4-.1-1.6-.8L3.3 12z" fill="currentColor" stroke="none" />
  </svg>
);

export const PlaneArrive = (p) => (
  <svg {...base(p)}>
    <path d="M3 20h18" />
    <path d="M6 8.5 8.8 11l7.7 1.6c1 .2 1.6-.9 1-1.7L20 6.5 18 6l-1 2-4-1-1.5-4.2L9.7 3z" fill="currentColor" stroke="none" />
  </svg>
);

export const Swap = (p) => (
  <svg {...base(p)}>
    <path d="M7 4 4 7l3 3" />
    <path d="M4 7h13" />
    <path d="M17 20l3-3-3-3" />
    <path d="M20 17H7" />
  </svg>
);

export const Calendar = (p) => (
  <svg {...base(p)}>
    <rect x="3" y="4.5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v3M16 3v3" />
  </svg>
);

export const User = (p) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </svg>
);

export const Chevron = (p) => (
  <svg {...base(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const ArrowUpRight = (p) => (
  <svg {...base(p)}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

export const OneWay = (p) => (
  <svg {...base(p)}>
    <path d="M4 12h14m0 0-4-4m4 4-4 4" />
  </svg>
);

export const RoundTrip = (p) => (
  <svg {...base(p)}>
    <path d="M4 9a8 8 0 0 1 14-4l2 2M20 5V2m0 3h-3" />
    <path d="M20 15a8 8 0 0 1-14 4l-2-2M4 19v3m0-3h3" />
  </svg>
);

export const Search = (p) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="6" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const Compare = (p) => (
  <svg {...base(p)}>
    <path d="M7 4 4 7l3 3M4 7h13M17 20l3-3-3-3M20 17H7" />
  </svg>
);

export const Book = (p) => (
  <svg {...base(p)}>
    <path d="M5 4h11a2 2 0 0 1 2 2v14l-4-2-4 2V6a2 2 0 0 0-2-2z" />
  </svg>
);

export const MapPin = (p) => (
  <svg {...base(p)}>
    <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const Check = (p) => (
  <svg {...base(p)}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const Minus = (p) => (
  <svg {...base(p)}>
    <path d="M5 12h14" />
  </svg>
);

export const ArrowLeft = (p) => (
  <svg {...base(p)}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export const Mail = (p) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

export const Phone = (p) => (
  <svg {...base(p)}>
    <path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 3 5a1 1 0 0 1 1-1z" />
  </svg>
);

export const Edit = (p) => (
  <svg {...base(p)}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);

export const Plane = (p) => (
  <svg {...base(p)}>
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L11 19v-5.5z" fill="currentColor" stroke="none" />
  </svg>
);

export const Instagram = (p) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const LinkedIn = (p) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 17v-7" />
  </svg>
);

export const XSocial = (p) => (
  <svg {...base(p)}>
    <path d="M4 4l16 16M20 4 4 20" />
  </svg>
);
