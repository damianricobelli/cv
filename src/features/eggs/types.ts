import { m } from "@/paraglide/messages";

export const EGG_IDS = [
  "guard",
  "palette",
  "blueprint",
  "accent",
  "elastic",
  "tab",
  "sudo",
  "emboss",
] as const;

export type EggId = (typeof EGG_IDS)[number];

/** Name and hint per egg. Functions, so they follow the active locale. */
export const EGG_COPY: Record<
  EggId,
  { name: () => string; hint: () => string; found: () => string }
> = {
  guard: {
    name: m.egg_guard_name,
    hint: m.egg_guard_hint,
    found: m.egg_guard_found,
  },
  palette: {
    name: m.egg_palette_name,
    hint: m.egg_palette_hint,
    found: m.egg_palette_found,
  },
  blueprint: {
    name: m.egg_blueprint_name,
    hint: m.egg_blueprint_hint,
    found: m.egg_blueprint_found,
  },
  accent: {
    name: m.egg_accent_name,
    hint: m.egg_accent_hint,
    found: m.egg_accent_found,
  },
  elastic: {
    name: m.egg_elastic_name,
    hint: m.egg_elastic_hint,
    found: m.egg_elastic_found,
  },
  tab: { name: m.egg_tab_name, hint: m.egg_tab_hint, found: m.egg_tab_found },
  sudo: {
    name: m.egg_sudo_name,
    hint: m.egg_sudo_hint,
    found: m.egg_sudo_found,
  },
  emboss: {
    name: m.egg_emboss_name,
    hint: m.egg_emboss_hint,
    found: m.egg_emboss_found,
  },
};

export function isEggId(value: unknown): value is EggId {
  return EGG_IDS.some((id) => id === value);
}
