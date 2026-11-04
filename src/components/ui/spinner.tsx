import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

function Spinner({
  "aria-label": ariaLabel,
  className,
  ...props
}: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      className={cn("size-4 animate-[spin_0.75s_linear_infinite]", className)}
      role={ariaLabel ? "status" : undefined}
      {...props}
    />
  );
}

export { Spinner };
