// ---------------------------------------------------------------------------
// Global client state for Builder Compass.
// Guest-first: everything persists to localStorage. No account, no server.
// When the AWS backend arrives, this store can hydrate from / sync to it.
//
// Hydration is manual (skipHydration) so the first client render matches the
// server HTML. <StoreHydrator /> loads saved data after mount and flips
// `hydrated`; pages that show saved data wait for it.
// ---------------------------------------------------------------------------

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CustomItem,
  PlanItem,
  PlanStatus,
  SessionRating,
  UserPrefs,
} from "@/types";

interface PersistedState {
  plan: PlanItem[];
  customItems: CustomItem[];
  prefs: UserPrefs;
}

interface CompassState extends PersistedState {
  hydrated: boolean;

  // plan actions
  addToPlan: (sessionId: string, status?: PlanStatus) => void;
  addManyToPlan: (sessionIds: string[]) => void;
  removeFromPlan: (sessionId: string) => void;
  isPlanned: (sessionId: string) => boolean;
  setStatus: (sessionId: string, status: PlanStatus) => void;
  setNote: (sessionId: string, text: string) => void;
  patchRating: (sessionId: string, patch: Partial<SessionRating>) => void;

  // custom items
  addCustomItem: (item: Omit<CustomItem, "id">) => void;
  removeCustomItem: (id: string) => void;

  // profile
  setPrefs: (patch: Partial<UserPrefs>) => void;

  // utility
  clearAll: () => void;
}

const defaultPrefs: UserPrefs = {
  interests: ["artificial intelligence", "developer tools", "serverless"],
  depth: 300,
  role: "Developer / Engineer",
  days: [],
  includeEvents: false,
  maxPerDay: 5,
  goal: "",
};

function newPlanItem(sessionId: string, status: PlanStatus = "planned"): PlanItem {
  return { sessionId, status, addedAt: new Date().toISOString() };
}

export const useCompassStore = create<CompassState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      plan: [],
      customItems: [],
      prefs: defaultPrefs,

      addToPlan: (sessionId, status = "planned") =>
        set((state) =>
          state.plan.some((p) => p.sessionId === sessionId)
            ? state
            : { plan: [...state.plan, newPlanItem(sessionId, status)] }
        ),

      addManyToPlan: (sessionIds) =>
        set((state) => {
          const have = new Set(state.plan.map((p) => p.sessionId));
          const fresh = Array.from(new Set(sessionIds))
            .filter((id) => !have.has(id))
            .map((id) => newPlanItem(id));
          return fresh.length ? { plan: [...state.plan, ...fresh] } : state;
        }),

      removeFromPlan: (sessionId) =>
        set((state) => ({
          plan: state.plan.filter((p) => p.sessionId !== sessionId),
        })),

      isPlanned: (sessionId) =>
        get().plan.some((p) => p.sessionId === sessionId),

      setStatus: (sessionId, status) =>
        set((state) => ({
          plan: state.plan.map((p) =>
            p.sessionId === sessionId ? { ...p, status } : p
          ),
        })),

      setNote: (sessionId, text) =>
        set((state) => ({
          plan: state.plan.map((p) =>
            p.sessionId === sessionId
              ? { ...p, note: { text, updatedAt: new Date().toISOString() } }
              : p
          ),
        })),

      patchRating: (sessionId, patch) =>
        set((state) => ({
          plan: state.plan.map((p) =>
            p.sessionId === sessionId
              ? { ...p, rating: { value: 0, ...p.rating, ...patch } }
              : p
          ),
        })),

      addCustomItem: (item) =>
        set((state) => ({
          customItems: [
            ...state.customItems,
            {
              ...item,
              id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            },
          ],
        })),

      removeCustomItem: (id) =>
        set((state) => ({
          customItems: state.customItems.filter((c) => c.id !== id),
        })),

      setPrefs: (patch) =>
        set((state) => ({ prefs: { ...state.prefs, ...patch } })),

      clearAll: () => set({ plan: [], customItems: [] }),
    }),
    {
      name: "builder-compass-v2",
      skipHydration: true,
      partialize: (s): PersistedState => ({
        plan: s.plan,
        customItems: s.customItems,
        prefs: s.prefs,
      }),
      // Newer preference fields fall back to defaults for older saved data.
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<PersistedState>;
        return {
          ...current,
          plan: saved.plan ?? current.plan,
          customItems: saved.customItems ?? current.customItems,
          prefs: { ...current.prefs, ...(saved.prefs ?? {}) },
        };
      },
    }
  )
);

/** True once saved data has been loaded from localStorage. */
export function useHydrated(): boolean {
  return useCompassStore((s) => s.hydrated);
}
