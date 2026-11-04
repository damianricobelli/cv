import { CheckIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { PhoneField, type PhoneFieldValue } from "@/components/ui/phone-field";
import { m } from "@/paraglide/messages";

/** phonefield 2, the same component Wonkka ships in production. */
export function PhoneDemo() {
  const [value, setValue] = useState<PhoneFieldValue | null>(null);
  const digits = value?.nationalNumber ?? "";
  const valid = Boolean(value?.isValid);

  return (
    <div className="grid gap-3">
      <label htmlFor="phone-demo" className="font-medium text-sm">
        {m.oss_phone_label()}
      </label>
      <PhoneField
        inputId="phone-demo"
        defaultCountry="AR"
        onValueChange={(next) => setValue(next)}
        inputLabel={m.oss_phone_label()}
        countryLabel={m.oss_phone_country()}
        countrySearchPlaceholder={m.oss_phone_search()}
        countryEmptyText={m.oss_phone_empty()}
      />
      <div className="flex min-h-6 flex-wrap items-center justify-between gap-2 font-mono text-muted-foreground text-xs">
        <span className="truncate">value: "{value?.e164 ?? ""}"</span>
        <AnimatePresence mode="popLayout" initial={false}>
          {valid ? (
            <motion.span
              key="valid"
              initial={{ opacity: 0, transform: "scale(0.9)" }}
              animate={{ opacity: 1, transform: "scale(1)" }}
              exit={{
                opacity: 0,
                transform: "scale(0.95)",
                transition: { duration: 0.12 },
              }}
              transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
              className="inline-flex items-center gap-1 rounded-full bg-success-muted px-2 py-0.5 text-success-muted-foreground"
            >
              <CheckIcon className="size-3.5" strokeWidth={3} aria-hidden />
              {m.oss_phone_valid()}
            </motion.span>
          ) : digits ? (
            <motion.span
              key="incomplete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
            >
              {m.oss_phone_incomplete()}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
