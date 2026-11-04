import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { PhoneField as PhoneFieldPrimitive, usePhoneField } from "phonefield";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

/**
 * The app's phone input on phonefield 2. Root owns the value, `disabled` and
 * the validity (it marks an incomplete number invalid once touched, and
 * `invalid` adds the form's own error), so the parts take neither.
 */
export function PhoneField({
  className,
  inputId,
  inputLabel,
  countryLabel,
  countrySearchPlaceholder,
  countryEmptyText,
  size = "default",
  ...props
}: Omit<PhoneFieldPrimitive.RootProps, "className"> & {
  className?: string;
  inputId?: string;
  inputLabel: string;
  countryLabel: string;
  countrySearchPlaceholder: string;
  countryEmptyText: string;
  size?: "sm" | "default";
}) {
  return (
    <PhoneFieldPrimitive.Root
      className={cn("w-full min-w-0", className)}
      {...props}
    >
      <InputGroup
        className={cn(
          "overflow-hidden",
          // Input renders with phonefield's data-slot, not InputGroup's.
          "has-[[data-slot=phone-field-input]:focus-visible]:border-ring has-[[data-slot=phone-field-input]:focus-visible]:ring-[3px] has-[[data-slot=phone-field-input]:focus-visible]:ring-ring/50",
          size === "sm" ? "h-8" : "h-9",
        )}
      >
        <PhoneFieldPrimitive.Input
          aria-label={inputLabel}
          autoComplete="tel"
          className="h-full px-3"
          id={inputId}
          render={<InputGroupInput />}
        />
        <InputGroupAddon
          align="inline-start"
          className="h-full cursor-default p-0"
        >
          <PhoneFieldPrimitive.Country
            labels={{
              search: countrySearchPlaceholder,
              empty: countryEmptyText,
            }}
          >
            <CountryTrigger label={countryLabel} />
            <PhoneFieldPrimitive.CountryPortal>
              <PhoneFieldPrimitive.CountryPositioner className="isolate z-50">
                <PhoneFieldPrimitive.CountryPopup className="flex max-h-[min(22rem,var(--available-height))] w-72 max-w-[var(--available-width)] origin-[var(--transform-origin)] flex-col overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-xl outline-none transition-[opacity,scale] duration-150 ease-out data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0 motion-reduce:transition-none">
                  <div className="border-b p-2">
                    <PhoneFieldPrimitive.CountrySearch className="h-9 w-full rounded-lg bg-muted px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
                  </div>
                  <PhoneFieldPrimitive.CountryEmpty className="px-3 py-6 text-center text-sm text-muted-foreground empty:hidden" />
                  <PhoneFieldPrimitive.CountryList className="min-h-0 flex-1 scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0">
                    {(country) => (
                      <PhoneFieldPrimitive.CountryItem
                        className="flex cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none select-none transition-colors duration-100 data-highlighted:bg-muted data-selected:bg-muted"
                        country={country}
                      >
                        <span aria-hidden>{country.flag}</span>
                        <span className="min-w-0 flex-1 truncate">
                          {country.name}
                        </span>
                        <span className="text-muted-foreground tabular-nums">
                          {country.dialCode}
                        </span>
                        <PhoneFieldPrimitive.CountryItemIndicator>
                          <CheckIcon className="size-4" />
                        </PhoneFieldPrimitive.CountryItemIndicator>
                      </PhoneFieldPrimitive.CountryItem>
                    )}
                  </PhoneFieldPrimitive.CountryList>
                </PhoneFieldPrimitive.CountryPopup>
              </PhoneFieldPrimitive.CountryPositioner>
            </PhoneFieldPrimitive.CountryPortal>
          </PhoneFieldPrimitive.Country>
        </InputGroupAddon>
      </InputGroup>
    </PhoneFieldPrimitive.Root>
  );
}

/**
 * Named "País: Argentina (+54)": an aria-label replaces phonefield's own name
 * (the selected country), so it carries both.
 */
function CountryTrigger({ label }: { label: string }) {
  const { country } = usePhoneField();
  return (
    <PhoneFieldPrimitive.CountryTrigger
      aria-label={`${label}: ${country.name} (${country.dialCode})`}
      className="group/phone-country-trigger flex h-full shrink-0 items-center gap-2 border-r border-input px-3 text-sm outline-none select-none transition-colors duration-150 hover:bg-muted focus-visible:bg-muted data-popup-open:bg-muted disabled:pointer-events-none disabled:opacity-50"
    >
      <PhoneFieldPrimitive.CountryValue>
        {(selected) => (
          <span className="flex items-center gap-2">
            <span aria-hidden>{selected.flag}</span>
            <span className="tabular-nums">{selected.dialCode}</span>
          </span>
        )}
      </PhoneFieldPrimitive.CountryValue>
      <PhoneFieldPrimitive.CountryIcon className="text-muted-foreground transition-transform duration-150 ease-out group-data-popup-open/phone-country-trigger:rotate-180 motion-reduce:transition-none">
        <ChevronDownIcon className="size-4" />
      </PhoneFieldPrimitive.CountryIcon>
    </PhoneFieldPrimitive.CountryTrigger>
  );
}

export type PhoneFieldInputValue = PhoneFieldPrimitive.InputValue;
export type PhoneFieldValue = PhoneFieldPrimitive.Value;
