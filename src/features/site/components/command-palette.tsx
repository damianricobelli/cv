import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Command } from "cmdk";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  CopyIcon,
  DraftingCompassIcon,
  ExternalLinkIcon,
  GitBranchIcon,
  LanguagesIcon,
  MonitorIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useEggs } from "@/features/eggs/components/eggs-provider";
import { useBlueprint } from "@/hooks/use-blueprint";
import { useThemeMode } from "@/hooks/use-theme-mode";
import { copyText } from "@/lib/clipboard";
import { PROFILE } from "@/lib/profile";
import { revealTransition } from "@/lib/view-transition";
import { m } from "@/paraglide/messages";
import { getLocale, localizeHref } from "@/paraglide/runtime";
import { SECTION_IDS, SECTION_LABEL } from "../flow";
import { useFlow } from "./flow-provider";

const ITEM =
  "flex h-11 cursor-default items-center gap-3 rounded-lg px-3 text-sm outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground";
const GROUP =
  "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:text-muted-foreground";

/**
 * ⌘K. Opened from the keyboard many times a visit, so it appears and leaves
 * instantly: no scale, no fade (Raycast does the same).
 */
export default function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { jump } = useFlow();
  const { find } = useEggs();
  const { setThemeMode } = useThemeMode();
  const { active: blueprint, setBlueprint } = useBlueprint();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      setSearch("");
      find("palette");
    }
  }, [open, find]);

  const run = (action: () => void) => {
    onOpenChange(false);
    // Let the dialog unmount first so view transitions capture the page, not the palette.
    requestAnimationFrame(action);
  };

  const theme = (mode: "light" | "dark" | "auto") =>
    run(() => revealTransition(() => setThemeMode(mode)));

  const otherLocale = getLocale() === "es" ? "en" : "es";
  const wantsSudo = search.trim().toLowerCase().startsWith("sudo");

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-[2px]" />
        <DialogPrimitive.Popup
          aria-label={m.common_command_palette()}
          className="fixed top-[max(12vh,env(safe-area-inset-top))] left-1/2 z-50 w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-lg outline-none"
        >
          <DialogPrimitive.Title className="sr-only">
            {m.common_command_palette()}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {m.common_command_search()}
          </DialogPrimitive.Description>
          <Command loop className="flex flex-col">
            <div className="flex items-center gap-3 border-b px-4">
              <SearchIcon
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder={m.palette_placeholder()}
                autoCapitalize="none"
                autoCorrect="off"
                className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Command.List className="max-h-[min(24rem,55dvh)] overflow-y-auto overscroll-contain p-1.5">
              {wantsSudo ? null : (
                <Command.Empty className="px-3 py-8 text-center text-muted-foreground text-sm">
                  {m.palette_empty()}
                </Command.Empty>
              )}

              {wantsSudo ? (
                <Command.Group
                  heading={m.palette_group_secret()}
                  className={GROUP}
                  forceMount
                >
                  <Command.Item
                    forceMount
                    value="sudo"
                    className={ITEM}
                    onSelect={() =>
                      run(() => {
                        find("sudo");
                        jump("contact");
                      })
                    }
                  >
                    <BadgeCheckIcon />
                    <span className="font-mono">{m.palette_sudo()}</span>
                  </Command.Item>
                </Command.Group>
              ) : null}

              <Command.Group
                heading={m.palette_group_navigate()}
                className={GROUP}
              >
                {SECTION_IDS.map((id, index) => (
                  <Command.Item
                    key={id}
                    value={`go ${id} ${SECTION_LABEL[id]()}`}
                    className={ITEM}
                    onSelect={() => run(() => jump(id))}
                  >
                    <ArrowRightIcon />
                    {m.palette_go_to({ section: SECTION_LABEL[id]() })}
                    <span className="ml-auto font-mono text-muted-foreground text-xs">
                      {index + 1}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group
                heading={m.palette_group_preferences()}
                className={GROUP}
              >
                <Command.Item
                  value="language idioma english español"
                  className={ITEM}
                  onSelect={() =>
                    run(() =>
                      window.location.assign(
                        localizeHref("/", { locale: otherLocale }),
                      ),
                    )
                  }
                >
                  <LanguagesIcon />
                  {m.palette_language()}
                </Command.Item>
                <Command.Item
                  value="theme light claro"
                  className={ITEM}
                  onSelect={() => theme("light")}
                >
                  <SunIcon />
                  {m.palette_theme_light()}
                </Command.Item>
                <Command.Item
                  value="theme dark oscuro"
                  className={ITEM}
                  onSelect={() => theme("dark")}
                >
                  <MoonIcon />
                  {m.palette_theme_dark()}
                </Command.Item>
                <Command.Item
                  value="theme system sistema"
                  className={ITEM}
                  onSelect={() => theme("auto")}
                >
                  <MonitorIcon />
                  {m.palette_theme_system()}
                </Command.Item>
                <Command.Item
                  value="blueprint plano"
                  className={ITEM}
                  onSelect={() =>
                    run(() => {
                      setBlueprint(!blueprint);
                      find("blueprint");
                    })
                  }
                >
                  <DraftingCompassIcon />
                  {m.palette_blueprint()}
                  <span className="ml-auto font-mono text-muted-foreground text-xs">
                    ↑↑↓↓←→←→BA
                  </span>
                </Command.Item>
              </Command.Group>

              <Command.Group
                heading={m.palette_group_actions()}
                className={GROUP}
              >
                <Command.Item
                  value="copy email copiar"
                  className={ITEM}
                  onSelect={() =>
                    run(async () => {
                      if (await copyText(PROFILE.email))
                        toast(m.contact_email_copied());
                    })
                  }
                >
                  <CopyIcon />
                  {m.palette_copy_email()}
                  <span className="ml-auto font-mono text-muted-foreground text-xs">
                    {PROFILE.email}
                  </span>
                </Command.Item>
                <Command.Item
                  value="github"
                  className={ITEM}
                  onSelect={() =>
                    run(() => window.open(PROFILE.github, "_blank", "noopener"))
                  }
                >
                  <GitBranchIcon />
                  {m.palette_github()}
                </Command.Item>
                <Command.Item
                  value="linkedin"
                  className={ITEM}
                  onSelect={() =>
                    run(() =>
                      window.open(PROFILE.linkedin, "_blank", "noopener"),
                    )
                  }
                >
                  <ExternalLinkIcon />
                  {m.palette_linkedin()}
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
