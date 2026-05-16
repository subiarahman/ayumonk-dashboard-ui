import sharp from "sharp";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "..", "public");

// Theme tokens mirror src/theme.js (light mode) and the user's reference shot.
const TEAL = "#0f766e";
const TEAL_DARK = "#115e59";
const TEAL_LIGHT = "#14b8a6";
const ORANGE = "#f59e0b";
const PURPLE = "#7c3aed";
const BLUE = "#0284c7";
const GREEN = "#16a34a";
const PINK = "#c026d3";
const AMBER = "#ca8a04";
const RED_ORANGE = "#ea580c";
const BG_CREAM = "#f7f2e9";
const BG_SOFT = "#fcfbf8";
const TEXT_PRIMARY = "#1f2937";
const TEXT_SECONDARY = "#5f6672";
const PAPER = "#ffffff";
const DIVIDER = "rgba(15,23,42,0.08)";

const FONT = "'Space Grotesk','Poppins','Segoe UI',sans-serif";

function rgba(hex, a) {
  const v = hex.replace("#", "");
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

const text = ({ x, y, content, size = 12, weight = 400, fill = TEXT_PRIMARY, anchor = "start" }) =>
  `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${content}</text>`;

const card = ({ x, y, w, h, fill = PAPER, stroke = DIVIDER, rx = 14 }) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ry="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`;

function kpiCard({ x, y, w, h, color, label, value, change, progress }) {
  const labelLines = String(label).split("\n");
  return `
    <g>
      ${card({ x, y, w, h, stroke: rgba(color, 0.32) })}
      <rect x="${x + 14}" y="${y + 14}" width="38" height="38" rx="11" fill="${rgba(color, 0.14)}"/>
      <circle cx="${x + 33}" cy="${y + 33}" r="8" fill="none" stroke="${color}" stroke-width="2.2"/>
      <rect x="${x + w - 64}" y="${y + 18}" width="50" height="22" rx="11" fill="${rgba(GREEN, 0.14)}"/>
      ${text({ x: x + w - 39, y: y + 33, content: change, size: 11, weight: 700, fill: "#15803d", anchor: "middle" })}
      ${labelLines
        .map((line, idx) =>
          text({
            x: x + 14,
            y: y + 78 + idx * 16,
            content: line,
            size: 12,
            weight: 700,
            fill: color,
          }),
        )
        .join("")}
      ${text({ x: x + 14, y: y + 78 + labelLines.length * 16 + 26, content: value, size: 30, weight: 800, fill: color })}
      <rect x="${x + 14}" y="${y + h - 18}" width="${w - 28}" height="5" rx="2.5" fill="${rgba(color, 0.12)}"/>
      <rect x="${x + 14}" y="${y + h - 18}" width="${(w - 28) * progress}" height="5" rx="2.5" fill="${color}"/>
    </g>
  `;
}

const installBanner = ({ x, y, w, h }) => `
  <g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${rgba(TEAL_LIGHT, 0.08)}" stroke="${rgba(TEAL, 0.3)}"/>
    <rect x="${x + 20}" y="${y + 22}" width="40" height="40" rx="10" fill="${rgba(TEAL, 0.14)}"/>
    <rect x="${x + 32}" y="${y + 32}" width="16" height="20" rx="2" fill="none" stroke="${TEAL}" stroke-width="2"/>
    <path d="M ${x + 36} ${y + 46} L ${x + 40} ${y + 50} L ${x + 44} ${y + 46}" stroke="${TEAL}" stroke-width="2" fill="none"/>
    ${text({ x: x + 76, y: y + 36, content: "Install Ayumonk on your device", size: 14, weight: 800, fill: TEAL_DARK })}
    ${text({ x: x + 76, y: y + 56, content: "Add to home screen for daily reminders, offline access, and an app-like experience. No App Store required.", size: 11, fill: TEXT_SECONDARY })}
    ${text({ x: x + 76, y: y + 78, content: 'Tip: open your browser menu and choose "Install app" or "Add to Home Screen" if the install prompt isn\'t available yet.', size: 10, fill: TEXT_SECONDARY })}
    <rect x="${x + w - 200}" y="${y + 28}" width="100" height="32" rx="8" fill="${rgba(TEAL, 0.5)}"/>
    ${text({ x: x + w - 150, y: y + 49, content: "Install Now", size: 12, weight: 700, fill: "#fff", anchor: "middle" })}
    <rect x="${x + w - 90}" y="${y + 28}" width="70" height="32" rx="8" fill="${PAPER}" stroke="${DIVIDER}"/>
    ${text({ x: x + w - 55, y: y + 49, content: "Later", size: 12, weight: 700, fill: TEXT_SECONDARY, anchor: "middle" })}
  </g>
`;

function buildWideSvg() {
  const W = 1280;
  const H = 720;
  const SIDEBAR_W = 240;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${BG_SOFT}"/>
        <stop offset="100%" stop-color="${BG_CREAM}"/>
      </linearGradient>
      <radialGradient id="glow1" cx="0%" cy="10%" r="40%">
        <stop offset="0%" stop-color="${rgba(TEAL_LIGHT, 0.22)}"/>
        <stop offset="100%" stop-color="${rgba(TEAL_LIGHT, 0)}"/>
      </radialGradient>
      <radialGradient id="glow2" cx="100%" cy="90%" r="32%">
        <stop offset="0%" stop-color="${rgba(ORANGE, 0.18)}"/>
        <stop offset="100%" stop-color="${rgba(ORANGE, 0)}"/>
      </radialGradient>
      <linearGradient id="hero" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${rgba(TEAL, 0.18)}"/>
        <stop offset="55%" stop-color="${rgba(PAPER, 0.92)}"/>
        <stop offset="100%" stop-color="${rgba(ORANGE, 0.12)}"/>
      </linearGradient>
    </defs>

    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#glow1)"/>
    <rect width="${W}" height="${H}" fill="url(#glow2)"/>

    <!-- Sidebar -->
    <rect x="0" y="0" width="${SIDEBAR_W}" height="${H}" fill="${PAPER}"/>
    <line x1="${SIDEBAR_W}" y1="0" x2="${SIDEBAR_W}" y2="${H}" stroke="${DIVIDER}"/>
    ${text({ x: 24, y: 42, content: "Google Dashboard", size: 18, weight: 800, fill: TEAL_DARK })}
    ${text({ x: 24, y: 78, content: "User Workspace", size: 11, weight: 500, fill: TEXT_SECONDARY })}

    ${[
      { label: "Dashboard", icon: "doc", active: true },
      { label: "Submissions", icon: "check" },
      { label: "My Profile", icon: "user" },
    ]
      .map((item, i) => {
        const yy = 142 + i * 56;
        const ic = (() => {
          if (item.icon === "check") return `<path d="M 30 ${yy - 7} L 34 ${yy - 3} L 42 ${yy - 12}" stroke="${TEAL}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="26" y="${yy - 16}" width="22" height="22" rx="4" fill="${rgba(TEAL, 0.12)}"/>`;
          if (item.icon === "user") return `<circle cx="36" cy="${yy - 9}" r="5" fill="none" stroke="${item.active ? TEAL : TEXT_SECONDARY}" stroke-width="2"/><path d="M 28 ${yy + 4} Q 36 ${yy - 4} 44 ${yy + 4}" stroke="${item.active ? TEAL : TEXT_SECONDARY}" stroke-width="2" fill="none"/>`;
          return `<rect x="28" y="${yy - 14}" width="16" height="20" rx="3" fill="none" stroke="${item.active ? TEAL : TEXT_SECONDARY}" stroke-width="2"/><line x1="32" y1="${yy - 8}" x2="40" y2="${yy - 8}" stroke="${item.active ? TEAL : TEXT_SECONDARY}" stroke-width="2"/><line x1="32" y1="${yy - 3}" x2="38" y2="${yy - 3}" stroke="${item.active ? TEAL : TEXT_SECONDARY}" stroke-width="2"/>`;
        })();
        return `
          ${item.active ? `<rect x="14" y="${yy - 22}" width="${SIDEBAR_W - 28}" height="44" rx="12" fill="${rgba(TEAL, 0.08)}"/>` : ""}
          ${item.icon === "check" ? ic : `<g>${ic}</g>`}
          ${text({ x: 64, y: yy + 1, content: item.label, size: 14, weight: item.active ? 700 : 500, fill: item.active ? TEAL_DARK : TEXT_PRIMARY })}
        `;
      })
      .join("")}

    <!-- Top bar -->
    <rect x="${SIDEBAR_W}" y="0" width="${W - SIDEBAR_W}" height="60" fill="${rgba(PAPER, 0.85)}"/>
    <line x1="${SIDEBAR_W}" y1="60" x2="${W}" y2="60" stroke="${DIVIDER}"/>
    <!-- hamburger -->
    <line x1="${SIDEBAR_W + 22}" y1="26" x2="${SIDEBAR_W + 40}" y2="26" stroke="${TEXT_PRIMARY}" stroke-width="2"/>
    <line x1="${SIDEBAR_W + 22}" y1="32" x2="${SIDEBAR_W + 40}" y2="32" stroke="${TEXT_PRIMARY}" stroke-width="2"/>
    <line x1="${SIDEBAR_W + 22}" y1="38" x2="${SIDEBAR_W + 40}" y2="38" stroke="${TEXT_PRIMARY}" stroke-width="2"/>
    ${text({ x: SIDEBAR_W + 60, y: 38, content: "Wellness Dashboard", size: 18, weight: 800, fill: TEXT_PRIMARY })}
    <!-- bell with badge -->
    <g transform="translate(${W - 160} 22)">
      <path d="M 0 8 Q 0 0 8 0 Q 16 0 16 8 L 16 14 L 18 18 L -2 18 L 0 14 Z" fill="none" stroke="${TEXT_SECONDARY}" stroke-width="2"/>
      <circle cx="14" cy="2" r="8" fill="${RED_ORANGE}"/>
      ${text({ x: 14, y: 6, content: "15", size: 9, weight: 800, fill: "#fff", anchor: "middle" })}
    </g>
    <!-- theme toggle -->
    <circle cx="${W - 116}" cy="30" r="11" fill="none" stroke="${TEXT_SECONDARY}" stroke-width="2"/>
    <path d="M ${W - 120} 24 Q ${W - 112} 30 ${W - 116} 38" fill="${TEXT_SECONDARY}"/>
    <!-- USER chip -->
    <rect x="${W - 90}" y="20" width="50" height="22" rx="6" fill="${rgba(TEAL, 0.08)}" stroke="${rgba(TEAL, 0.3)}"/>
    ${text({ x: W - 65, y: 35, content: "USER", size: 10, weight: 800, fill: TEAL, anchor: "middle" })}
    <!-- avatar -->
    <circle cx="${W - 22}" cy="30" r="14" fill="${rgba(TEAL, 0.16)}"/>
    ${text({ x: W - 22, y: 35, content: "E", size: 14, weight: 800, fill: TEAL, anchor: "middle" })}

    <!-- Install banner -->
    ${installBanner({ x: SIDEBAR_W + 24, y: 80, w: W - SIDEBAR_W - 48, h: 100 })}

    <!-- Hero card -->
    <g transform="translate(${SIDEBAR_W + 24} 196)">
      <rect width="${W - SIDEBAR_W - 48}" height="180" rx="18" fill="url(#hero)" stroke="${DIVIDER}"/>
      ${text({ x: 28, y: 44, content: "PERSONAL WELLNESS JOURNEY", size: 11, weight: 800, fill: TEAL })}
      ${text({ x: 28, y: 84, content: "Welcome back, Ayumonk User", size: 28, weight: 800, fill: TEXT_PRIMARY })}
      ${text({ x: 28, y: 116, content: "Switch between your personal wellness overview and the daily challenge experience", size: 13, fill: TEXT_SECONDARY })}
      ${text({ x: 28, y: 138, content: "requested in the client reference, while keeping the existing dashboard theme intact.", size: 13, fill: TEXT_SECONDARY })}

      <!-- Right column: tabs + caption + Notifications pill -->
      <g transform="translate(${W - SIDEBAR_W - 48 - 360} 28)">
        <rect width="340" height="44" rx="22" fill="${rgba(PAPER, 0.55)}"/>
        <rect x="6" y="6" width="164" height="32" rx="16" fill="${rgba(TEAL, 0.14)}"/>
        ${text({ x: 88, y: 27, content: "My Wellness", size: 13, weight: 700, fill: TEAL, anchor: "middle" })}
        ${text({ x: 256, y: 27, content: "Challenges", size: 13, weight: 700, fill: TEXT_SECONDARY, anchor: "middle" })}
        ${text({ x: 0, y: 68, content: "Personal wellness journey, trends, dosha balance, and", size: 12, fill: TEXT_SECONDARY })}
        ${text({ x: 0, y: 86, content: "suggestions.", size: 12, fill: TEXT_SECONDARY })}
        <!-- Notifications on pill (active state) -->
        <rect x="0" y="100" width="200" height="36" rx="18" fill="${TEAL}"/>
        <g transform="translate(16 118)">
          <path d="M 0 -2 Q 0 -10 8 -10 Q 16 -10 16 -2 L 16 6 L 18 10 L -2 10 L 0 6 Z" fill="none" stroke="#fff" stroke-width="2"/>
          <circle cx="8" cy="14" r="2" fill="#fff"/>
        </g>
        ${text({ x: 50, y: 124, content: "Notifications on", size: 13, weight: 700, fill: "#fff" })}
      </g>
    </g>

    <!-- KPI row (7 cards matching the reference) -->
    ${(() => {
      const KPIS = [
        { color: PURPLE, label: "Physical\nVitality", value: "100", change: "+0%", progress: 1.0 },
        { color: RED_ORANGE, label: "Cognitive\nFocus", value: "80", change: "+300%", progress: 0.8 },
        { color: TEAL, label: "Physical\nVitality", value: "100", change: "+400%", progress: 1.0 },
        { color: BLUE, label: "Physical\nVitality", value: "20", change: "+0%", progress: 0.2 },
        { color: AMBER, label: "Physical\nVitality", value: "20", change: "+0%", progress: 0.2 },
        { color: PINK, label: "Physical\nComfort", value: "80", change: "+0%", progress: 0.8 },
        { color: GREEN, label: "Emotional\nWell-being", value: "40", change: "+0%", progress: 0.4 },
      ];
      const total = W - SIDEBAR_W - 48;
      const gap = 12;
      const cardW = (total - gap * (KPIS.length - 1)) / KPIS.length;
      return KPIS.map((kpi, i) =>
        kpiCard({
          x: SIDEBAR_W + 24 + i * (cardW + gap),
          y: 400,
          w: cardW,
          h: 200,
          ...kpi,
        }),
      ).join("");
    })()}

    <!-- Three lower cards: Wellness Index / Trends / Dosha (just headers visible at this fold) -->
    <g transform="translate(${SIDEBAR_W + 24} 616)">
      ${card({ x: 0, y: 0, w: 320, h: 100 })}
      ${text({ x: 20, y: 32, content: "Wellness Index", size: 15, weight: 800, fill: TEXT_PRIMARY })}
      ${text({ x: 20, y: 56, content: "Overall score based on your key", size: 11, fill: TEXT_SECONDARY })}
      ${text({ x: 20, y: 72, content: "wellness factors", size: 11, fill: TEXT_SECONDARY })}
    </g>
    <g transform="translate(${SIDEBAR_W + 24 + 332} 616)">
      ${card({ x: 0, y: 0, w: 500, h: 100 })}
      ${text({ x: 20, y: 32, content: "Wellness Trends", size: 15, weight: 800, fill: TEXT_PRIMARY })}
      ${text({ x: 20, y: 56, content: "Weekly movement across your", size: 11, fill: TEXT_SECONDARY })}
      ${text({ x: 20, y: 72, content: "strongest improvement areas", size: 11, fill: TEXT_SECONDARY })}
      <rect x="320" y="20" width="50" height="22" rx="11" fill="${PAPER}" stroke="${DIVIDER}"/>
      ${text({ x: 345, y: 35, content: "Daily", size: 10, weight: 700, fill: TEXT_SECONDARY, anchor: "middle" })}
      <rect x="378" y="20" width="58" height="22" rx="11" fill="${TEAL}"/>
      ${text({ x: 407, y: 35, content: "Weekly", size: 10, weight: 700, fill: "#fff", anchor: "middle" })}
      <rect x="444" y="20" width="62" height="22" rx="11" fill="${PAPER}" stroke="${DIVIDER}"/>
      ${text({ x: 475, y: 35, content: "Monthly", size: 10, weight: 700, fill: TEXT_SECONDARY, anchor: "middle" })}
    </g>
    <g transform="translate(${SIDEBAR_W + 24 + 332 + 512} 616)">
      ${card({ x: 0, y: 0, w: W - SIDEBAR_W - 48 - 332 - 512, h: 100 })}
      ${text({ x: 20, y: 32, content: "Dosha Profile", size: 15, weight: 800, fill: TEXT_PRIMARY })}
      ${text({ x: 20, y: 56, content: "Balanced composition based on", size: 11, fill: TEXT_SECONDARY })}
      ${text({ x: 20, y: 72, content: "the latest assessment", size: 11, fill: TEXT_SECONDARY })}
    </g>
  </svg>`;
}

function buildMobileSvg() {
  const W = 390;
  const H = 844;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${BG_SOFT}"/>
        <stop offset="100%" stop-color="${BG_CREAM}"/>
      </linearGradient>
      <radialGradient id="glow1" cx="0%" cy="0%" r="60%">
        <stop offset="0%" stop-color="${rgba(TEAL_LIGHT, 0.2)}"/>
        <stop offset="100%" stop-color="${rgba(TEAL_LIGHT, 0)}"/>
      </radialGradient>
      <linearGradient id="hero" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${rgba(TEAL, 0.2)}"/>
        <stop offset="100%" stop-color="${rgba(ORANGE, 0.14)}"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#glow1)"/>

    <!-- Status bar -->
    ${text({ x: 24, y: 28, content: "9:41", size: 13, weight: 700, fill: TEXT_PRIMARY })}
    <circle cx="${W - 60}" cy="22" r="3" fill="${TEXT_PRIMARY}"/>
    <circle cx="${W - 50}" cy="22" r="3" fill="${TEXT_PRIMARY}"/>
    <rect x="${W - 36}" y="16" width="24" height="12" rx="3" fill="none" stroke="${TEXT_PRIMARY}" stroke-width="1.2"/>
    <rect x="${W - 34}" y="18" width="18" height="8" rx="1" fill="${TEXT_PRIMARY}"/>

    <!-- Top bar -->
    <g transform="translate(0 52)">
      <line x1="16" y1="14" x2="34" y2="14" stroke="${TEXT_PRIMARY}" stroke-width="2"/>
      <line x1="16" y1="20" x2="34" y2="20" stroke="${TEXT_PRIMARY}" stroke-width="2"/>
      <line x1="16" y1="26" x2="34" y2="26" stroke="${TEXT_PRIMARY}" stroke-width="2"/>
      ${text({ x: 50, y: 26, content: "Wellness Dashboard", size: 14, weight: 800, fill: TEXT_PRIMARY })}
      <g transform="translate(${W - 86} 12)">
        <path d="M 0 8 Q 0 0 8 0 Q 16 0 16 8 L 16 14 L 18 18 L -2 18 L 0 14 Z" fill="none" stroke="${TEXT_SECONDARY}" stroke-width="2"/>
        <circle cx="14" cy="2" r="7" fill="${RED_ORANGE}"/>
        ${text({ x: 14, y: 6, content: "15", size: 8, weight: 800, fill: "#fff", anchor: "middle" })}
      </g>
      <circle cx="${W - 50}" cy="20" r="10" fill="none" stroke="${TEXT_SECONDARY}" stroke-width="2"/>
      <circle cx="${W - 20}" cy="20" r="12" fill="${rgba(TEAL, 0.16)}"/>
      ${text({ x: W - 20, y: 25, content: "E", size: 13, weight: 800, fill: TEAL, anchor: "middle" })}
    </g>

    <!-- Install banner (compact) -->
    <g transform="translate(16 100)">
      <rect width="${W - 32}" height="84" rx="14" fill="${rgba(TEAL_LIGHT, 0.08)}" stroke="${rgba(TEAL, 0.3)}"/>
      <rect x="14" y="14" width="36" height="36" rx="9" fill="${rgba(TEAL, 0.14)}"/>
      <rect x="24" y="22" width="16" height="20" rx="2" fill="none" stroke="${TEAL}" stroke-width="2"/>
      <path d="M 28 36 L 32 40 L 36 36" stroke="${TEAL}" stroke-width="2" fill="none"/>
      ${text({ x: 60, y: 32, content: "Install Ayumonk", size: 12, weight: 800, fill: TEAL_DARK })}
      ${text({ x: 60, y: 50, content: "Add to home screen for daily reminders,", size: 10, fill: TEXT_SECONDARY })}
      ${text({ x: 60, y: 64, content: "offline access, and an app-like feel.", size: 10, fill: TEXT_SECONDARY })}
      <rect x="14" y="62" width="92" height="14" rx="7" fill="${rgba(TEAL, 0.5)}"/>
      ${text({ x: 60, y: 72, content: "Install Now", size: 9, weight: 700, fill: "#fff", anchor: "middle" })}
    </g>

    <!-- Hero -->
    <g transform="translate(16 200)">
      <rect width="${W - 32}" height="170" rx="16" fill="url(#hero)" stroke="${DIVIDER}"/>
      ${text({ x: 18, y: 30, content: "PERSONAL WELLNESS JOURNEY", size: 9, weight: 800, fill: TEAL })}
      ${text({ x: 18, y: 64, content: "Welcome back,", size: 20, weight: 800, fill: TEXT_PRIMARY })}
      ${text({ x: 18, y: 88, content: "Ayumonk User", size: 20, weight: 800, fill: TEXT_PRIMARY })}
      ${text({ x: 18, y: 112, content: "Personal wellness journey, trends, dosha", size: 11, fill: TEXT_SECONDARY })}
      ${text({ x: 18, y: 128, content: "balance, and suggestions.", size: 11, fill: TEXT_SECONDARY })}
      <!-- Notifications on pill -->
      <rect x="18" y="138" width="170" height="22" rx="11" fill="${TEAL}"/>
      <g transform="translate(30 149)">
        <path d="M 0 -2 Q 0 -8 6 -8 Q 12 -8 12 -2 L 12 4 L 14 7 L -2 7 L 0 4 Z" fill="none" stroke="#fff" stroke-width="1.6"/>
      </g>
      ${text({ x: 56, y: 153, content: "Notifications on", size: 11, weight: 700, fill: "#fff" })}
    </g>

    <!-- KPI grid 2 cols x 3 rows -->
    ${(() => {
      const KPIS = [
        { color: PURPLE, label: "Physical\nVitality", value: "100", change: "+0%", progress: 1.0 },
        { color: RED_ORANGE, label: "Cognitive\nFocus", value: "80", change: "+300%", progress: 0.8 },
        { color: TEAL, label: "Physical\nVitality", value: "100", change: "+400%", progress: 1.0 },
        { color: BLUE, label: "Physical\nVitality", value: "20", change: "+0%", progress: 0.2 },
        { color: PINK, label: "Physical\nComfort", value: "80", change: "+0%", progress: 0.8 },
        { color: GREEN, label: "Emotional\nWell-being", value: "40", change: "+0%", progress: 0.4 },
      ];
      const cardW = (W - 32 - 12) / 2;
      const cardH = 132;
      const gapY = 12;
      return KPIS.map((kpi, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        return kpiCard({
          x: 16 + col * (cardW + 12),
          y: 388 + row * (cardH + gapY),
          w: cardW,
          h: cardH,
          ...kpi,
        });
      }).join("");
    })()}

    <!-- Wellness Index strip -->
    <g transform="translate(16 808)">
      ${card({ x: 0, y: 0, w: W - 32, h: 28 })}
      <circle cx="20" cy="14" r="9" fill="none" stroke="${TEAL}" stroke-width="3"/>
      <path d="M 14 14 A 6 6 0 0 1 26 14" fill="none" stroke="${ORANGE}" stroke-width="3"/>
      ${text({ x: 38, y: 18, content: "Wellness Index · 92.5 / 100", size: 11, weight: 800, fill: TEAL_DARK })}
    </g>
  </svg>`;
}

async function render(svg, outPath, w, h) {
  await sharp(Buffer.from(svg), { density: 300 })
    .resize(w, h, { fit: "fill" })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log(`generated ${outPath} (${w}x${h})`);
}

async function main() {
  await render(buildWideSvg(), resolve(publicDir, "screenshot-wide.png"), 1280, 720);
  await render(buildMobileSvg(), resolve(publicDir, "screenshot-mobile.png"), 390, 844);
  console.log("PWA screenshots generated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
