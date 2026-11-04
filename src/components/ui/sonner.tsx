"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps, toast } from "sonner";
import { useThemeMode } from "@/hooks/use-theme-mode";
import { cn } from "@/lib/utils";

const Toaster = ({ ...props }: ToasterProps) => {
  // The app's own theme (the user menu's light / dark / auto), not
  // next-themes, which has no provider here and only followed the system.
  const { resolvedTheme } = useThemeMode();

  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      richColors
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "var(--success-muted)",
          "--success-text": "var(--popover-foreground)",
          "--success-border":
            "color-mix(in oklab, var(--success) 22%, var(--success-muted))",
          "--info-bg": "var(--info-muted)",
          "--info-text": "var(--popover-foreground)",
          "--info-border":
            "color-mix(in oklab, var(--info) 22%, var(--info-muted))",
          "--warning-bg": "var(--warning-muted)",
          "--warning-text": "var(--popover-foreground)",
          "--warning-border":
            "color-mix(in oklab, var(--warning) 22%, var(--warning-muted))",
          "--error-bg": "var(--destructive-muted)",
          "--error-text": "var(--popover-foreground)",
          "--error-border":
            "color-mix(in oklab, var(--destructive) 22%, var(--destructive-muted))",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: cn(
            "cn-toast rounded-lg border shadow-md",
            "[&_[data-description]]:text-current [&_[data-button]]:focus-visible:ring-2 [&_[data-button]]:focus-visible:ring-offset-0",
          ),
          title: "font-medium",
          description: "text-current",
          icon: "text-current",
          actionButton:
            "border-border bg-background/80 text-foreground hover:bg-accent hover:text-accent-foreground",
          cancelButton:
            "border-border bg-background/50 text-muted-foreground hover:bg-muted hover:text-foreground",
          closeButton:
            "border-border bg-background/70 text-muted-foreground hover:bg-muted hover:text-foreground",
          success:
            "[&_[data-button]]:focus-visible:ring-success/20 [&_[data-icon]]:text-success-muted-foreground",
          error:
            "[&_[data-button]]:focus-visible:ring-destructive/20 [&_[data-icon]]:text-destructive-muted-foreground",
          info: "[&_[data-button]]:focus-visible:ring-info/20 [&_[data-icon]]:text-info-muted-foreground",
          warning:
            "[&_[data-button]]:focus-visible:ring-warning/20 [&_[data-icon]]:text-warning-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
