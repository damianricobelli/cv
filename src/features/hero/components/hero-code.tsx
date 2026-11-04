import { useFlow } from "@/features/site/components/flow-provider";
import { SECTION_IDS, type SectionId } from "@/features/site/flow";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

/**
 * The site's own step definition, printed as code. Each id is a button that
 * navigates through the real stepper, so its guard applies.
 */
export function HeroCode() {
  const { active, go } = useFlow();

  return (
    <figure className="grid gap-3" data-bp="defineStepper()">
      <pre className="overflow-x-auto rounded-2xl border bg-card/80 px-5 py-4 font-mono text-[13px] leading-[1.8] shadow-sm">
        <code>
          <span className="text-ink">import</span> {"{ defineStepper }"}{" "}
          <span className="text-ink">from</span>{" "}
          <span className="text-success-muted-foreground">
            "@stepperize/react"
          </span>
          {"\n\n"}
          <span className="text-ink">const</span> site ={" "}
          <span className="font-semibold">defineStepper</span>([
          {SECTION_IDS.map((id) => (
            <span key={id}>
              {"\n  { id: "}
              <StepToken
                id={id}
                active={id === active}
                onGo={() => void go(id)}
              />
              {" },"}
            </span>
          ))}
          {"\n])"}
        </code>
      </pre>
      <figcaption className="px-1 text-muted-foreground text-sm">
        {m.hero_code_hint()}
      </figcaption>
    </figure>
  );
}

function StepToken({
  id,
  active,
  onGo,
}: {
  id: SectionId;
  active: boolean;
  onGo: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onGo}
      aria-current={active ? "step" : undefined}
      className={cn(
        "-mx-1 rounded-md px-1 text-success-muted-foreground transition-[background-color,color,box-shadow] duration-150",
        "hover:bg-a3 hover:text-ink focus-visible:bg-a3",
        active && "bg-a3 text-ink shadow-[inset_0_-2px_0_var(--accent-9)]",
      )}
    >
      "{id}"
    </button>
  );
}
