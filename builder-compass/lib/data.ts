// ---------------------------------------------------------------------------
// Data access layer — the single swap point for a real backend.
//
// Today this reads bundled mock JSON. Later, your team can replace the bodies
// of these functions with calls to an AWS backend (API Gateway + Lambda, or
// AppSync/GraphQL) WITHOUT touching any UI code, because the rest of the app
// only ever imports from here.
// ---------------------------------------------------------------------------

import sessionsJson from "@/data/sessions.json";
import venuesJson from "@/data/venues.json";
import type { Session, VenueGraph } from "@/types";

// Simulate async so the UI is already written for a network round-trip.
function delay<T>(value: T, ms = 0): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function getSessions(): Promise<Session[]> {
  // FUTURE (AWS): return fetch(`${API_BASE}/sessions`).then(r => r.json());
  return delay(sessionsJson as Session[]);
}

export async function getVenueGraph(): Promise<VenueGraph> {
  // FUTURE (AWS): return fetch(`${API_BASE}/venues`).then(r => r.json());
  return delay(venuesJson as VenueGraph);
}

// Convenience synchronous accessors for code that already has the data loaded.
export function allSessionsSync(): Session[] {
  return sessionsJson as Session[];
}

export function venueGraphSync(): VenueGraph {
  return venuesJson as VenueGraph;
}
