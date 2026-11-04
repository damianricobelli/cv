import { defineStepper } from "@stepperize/react/headless";
import { m } from "@/paraglide/messages";

/**
 * The page itself is a Stepperize flow: one step per section. The ids appear
 * in the hero's code sample and in the URL hash, so they stay in English.
 */
export const siteFlow = defineStepper([
  { id: "intro" },
  { id: "career" },
  { id: "open-source" },
  { id: "contact" },
] as const);

export type SectionId = (typeof siteFlow.steps)[number]["id"];

export const SECTION_IDS: readonly SectionId[] = siteFlow.steps.map(
  (step) => step.id,
);

export const SECTION_LABEL: Record<SectionId, () => string> = {
  intro: m.nav_intro,
  career: m.nav_career,
  "open-source": m.nav_oss,
  contact: m.nav_contact,
};
