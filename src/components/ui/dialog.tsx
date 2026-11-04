import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { InsideDrawer, useInsideDrawer } from "@/components/ui/overlay-stack";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 min-h-dvh bg-black/80 transition-opacity duration-200 ease-out supports-backdrop-filter:backdrop-blur-xs data-ending-style:opacity-0 data-ending-style:duration-150 data-starting-style:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
}) {
  // Nested in a bottom sheet, which doesn't step back for it: dim it here.
  const insideDrawer = useInsideDrawer();
  return (
    <DialogPortal>
      <DialogOverlay forceRender={insideDrawer} />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] overflow-y-auto -translate-x-1/2 translate-y-[calc(-50%+1.5rem*var(--nested-dialogs))] scale-[calc(1-0.2*var(--nested-dialogs))] gap-6 rounded-lg bg-popover p-6 text-sm text-popover-foreground ring-1 ring-foreground/5 overscroll-contain outline-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-foreground/10 after:opacity-0 after:pointer-events-none after:transition-opacity after:duration-150 data-nested-dialog-open:after:opacity-100 sm:max-w-md transition-[opacity,scale,translate] duration-200 ease-out data-starting-style:scale-[0.96] data-starting-style:opacity-0 data-ending-style:scale-[0.96] data-ending-style:opacity-0 data-ending-style:duration-150 motion-reduce:transition-opacity motion-reduce:data-starting-style:scale-100 motion-reduce:data-ending-style:scale-100",
          className,
        )}
        {...props}
      >
        <InsideDrawer value={false}>{children}</InsideDrawer>
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-4 right-4"
                size="icon-sm"
              />
            }
          >
            <XIcon />
            <span className="sr-only">{m.common_close()}</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogSection({
  action,
  className,
  children,
  description,
  headingId,
  title,
  ...props
}: React.ComponentProps<"section"> & {
  action?: React.ReactNode;
  description?: React.ReactNode;
  headingId: string;
  title: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={headingId}
      data-slot="dialog-section"
      className={cn("grid gap-3 border-t pt-5", className)}
      {...props}
    >
      <div className="grid gap-1">
        <div className="flex items-center gap-1.5">
          <h3 id={headingId} className="text-sm font-semibold text-foreground">
            {title}
          </h3>
          {action}
        </div>
        {description ? (
          <p className="text-sm leading-normal text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          {m.common_close()}
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-none font-medium",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogSection,
  DialogTitle,
  DialogTrigger,
};
