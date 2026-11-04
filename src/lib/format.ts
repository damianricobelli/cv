import { intlLocale } from "@/i18n";
import { getLocale } from "@/paraglide/runtime";

export function formatNumber(value: number) {
  return new Intl.NumberFormat(intlLocale[getLocale()]).format(value);
}

/** 1610 → "1,6 mil" / "1.6K". */
export function formatCompact(value: number) {
  return new Intl.NumberFormat(intlLocale[getLocale()], {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
