import { createContext, use } from "react";

/**
 * Whether an overlay renders inside a bottom sheet (Base UI Drawer).
 *
 * Base UI nests overlays by React tree: a dialog opened from inside another
 * one brings no backdrop, and its parent steps back through
 * `data-nested-dialog-open`. A drawer only steps back for nested drawers, so a
 * centered dialog nested in one would float over a sheet nobody dimmed. Those
 * dialogs force their own backdrop instead; every other parent styles itself.
 */
const InsideDrawerContext = createContext(false);

export const InsideDrawer = InsideDrawerContext.Provider;

export function useInsideDrawer() {
  return use(InsideDrawerContext);
}
