import { atom } from "jotai";

// The exercise finished on its page, celebrated once back on the list.
export const JUST_FINISHED_ATOM = atom<string | null>(null);

export const HIGHLIGHT_DURATION = 2500;

// A long press lifts a card for dragging; a short tap opens it.
export const DRAG_DELAY = 420;
export const DRAG_TOLERANCE = 8;
