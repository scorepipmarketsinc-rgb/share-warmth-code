import { createContext, ReactNode, useCallback, useContext, useState } from "react";

/**
 * Two-stage sidebar collapse, ChatGPT-style.
 * Level 0: both rails expanded.
 * Level 1: secondary list (conversations) collapsed.
 * Level 2: primary nav rail also collapsed → max canvas.
 *
 * Toggling cycles 0 → 1 → 2 → 1 → 0 (reverses direction at the ends).
 */
type Ctx = {
  level: 0 | 1 | 2;
  navCollapsed: boolean;
  listCollapsed: boolean;
  toggle: () => void;
};

const SidebarCollapseContext = createContext<Ctx | null>(null);

export function SidebarCollapseProvider({ children }: { children: ReactNode }) {
  const [level, setLevel] = useState<0 | 1 | 2>(0);
  const [dir, setDir] = useState<1 | -1>(1);

  const toggle = useCallback(() => {
    setLevel((l) => {
      let next = l + dir;
      let nextDir = dir;
      if (next > 2) {
        next = 1;
        nextDir = -1;
      } else if (next < 0) {
        next = 1;
        nextDir = 1;
      }
      setDir(nextDir as 1 | -1);
      return next as 0 | 1 | 2;
    });
  }, [dir]);

  return (
    <SidebarCollapseContext.Provider
      value={{ level, navCollapsed: level >= 2, listCollapsed: level >= 1, toggle }}
    >
      {children}
    </SidebarCollapseContext.Provider>
  );
}

export function useSidebarCollapse() {
  const ctx = useContext(SidebarCollapseContext);
  if (!ctx) throw new Error("useSidebarCollapse must be used within SidebarCollapseProvider");
  return ctx;
}
