import { m } from "@/paraglide/messages";

/** main: employment · founder: products I started · oss: libraries I publish. */
export type Lane = "main" | "founder" | "oss";
export const LANES: readonly Lane[] = ["main", "founder", "oss"];

/** "2026-09" (month precision) or "2017" (year only). */
type YearMonth = `${number}-${string}` | `${number}`;

export type CareerEntry = {
  id: string;
  lane: Lane;
  /** Jobs read "Role · Org"; releases read like a commit subject. */
  title: { role: string; org: string } | { commit: string };
  start: YearMonth;
  end?: YearMonth | "present";
  location?: () => string;
  summary: () => string;
  highlights?: Array<() => string>;
  link?: { href: string; label: string };
  /** Where this lane branches off main (the entry right below its first commit). */
  forkOf?: Lane;
};

/** Newest first, like `git log`. Roles stay in English, as on LinkedIn. */
export const CAREER: readonly CareerEntry[] = [
  {
    id: "wonkka",
    lane: "founder",
    title: { role: "Founder", org: "Wonkka" },
    start: "2026-09",
    end: "present",
    summary: m.career_wonkka_summary,
    highlights: [m.career_wonkka_h1, m.career_wonkka_h2, m.career_wonkka_h3],
    link: { href: "https://wonkka.app", label: "wonkka.app" },
  },
  {
    id: "radixcn",
    lane: "oss",
    title: { commit: "feat: radixcn" },
    start: "2026-05",
    summary: m.career_radixcn_summary,
    link: { href: "https://radixcn.com", label: "radixcn.com" },
  },
  {
    id: "urbs",
    lane: "main",
    title: { role: "Lead Frontend Engineer", org: "Urbs Data" },
    start: "2026-03",
    end: "present",
    summary: m.career_urbs_summary,
  },
  {
    id: "phonefield",
    lane: "oss",
    title: { commit: "feat: phonefield" },
    start: "2026-02",
    summary: m.career_phonefield_summary,
    link: {
      href: "https://phonefield.vercel.app",
      label: "phonefield.vercel.app",
    },
  },
  {
    id: "spenty",
    lane: "oss",
    title: { commit: "feat: spenty" },
    start: "2026-02",
    summary: m.career_spenty_summary,
    link: { href: "https://spenty.app", label: "spenty.app" },
  },
  {
    id: "iyk",
    lane: "main",
    title: { role: "Senior Frontend Engineer", org: "IYK*" },
    start: "2024-04",
    end: "2025-10",
    location: m.career_location_us,
    summary: m.career_iyk_summary,
  },
  {
    id: "shadcn",
    lane: "oss",
    title: { commit: "feat: cal-com · phone-input · linear-combobox" },
    start: "2024-04",
    summary: m.career_shadcn_summary,
    link: {
      href: "https://github.com/damianricobelli/shadcn-cal-com",
      label: "github.com/damianricobelli",
    },
  },
  {
    id: "stepperize",
    lane: "oss",
    title: { commit: "feat: stepperize" },
    start: "2024-04",
    summary: m.career_stepperize_summary,
    link: { href: "https://stepperize.com", label: "stepperize.com" },
  },
  {
    id: "roofer",
    lane: "main",
    title: { role: "Lead Frontend Engineer", org: "Roofer.com" },
    start: "2023-09",
    end: "2024-03",
    location: m.career_location_us,
    summary: m.career_roofer_summary,
    highlights: [m.career_roofer_h1, m.career_roofer_h2, m.career_roofer_h3],
    forkOf: "oss",
  },
  {
    id: "guruhotel",
    lane: "main",
    title: { role: "Senior Frontend Engineer", org: "GuruHotel" },
    start: "2021-06",
    end: "2023-09",
    location: m.career_location_mx,
    summary: m.career_guru_summary,
    highlights: [m.career_guru_h1, m.career_guru_h2, m.career_guru_h3],
  },
  {
    id: "fluxit",
    lane: "main",
    title: { role: "Ssr. Frontend Developer", org: "Flux IT" },
    start: "2020-12",
    end: "2021-06",
    location: m.career_location_ar,
    summary: m.career_flux_summary,
    highlights: [m.career_flux_h1, m.career_flux_h2],
  },
  {
    id: "doc24",
    lane: "main",
    title: { role: "Frontend Developer", org: "DOC24" },
    start: "2020-06",
    end: "2020-12",
    location: m.career_location_rosario,
    summary: m.career_doc24_summary,
    highlights: [m.career_doc24_h1, m.career_doc24_h2],
  },
  {
    id: "cookep",
    lane: "founder",
    title: { role: "Co-Founder", org: "Cookep" },
    start: "2019-08",
    end: "2021-07",
    location: m.career_location_ar,
    summary: m.career_cookep_summary,
  },
  {
    id: "freelance",
    lane: "main",
    title: { role: "Frontend Developer", org: "Freelance" },
    start: "2017",
    end: "2020-11",
    location: m.career_location_remote,
    summary: m.career_freelance_summary,
    forkOf: "founder",
  },
  {
    id: "init",
    lane: "main",
    title: { commit: "git init" },
    start: "2016-09",
    summary: m.career_init_summary,
    link: {
      href: "https://github.com/damianricobelli",
      label: "github.com/damianricobelli",
    },
  },
];

/** A stable, commit-looking short hash per entry. */
export function shortHash(id: string) {
  let hash = 2166136261;
  for (const char of id) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0").slice(0, 7);
}
