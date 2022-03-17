import { writable, derived } from "svelte/store";

// export const currentCursor = writable([-1, -1]);
export const cursorX = writable(1);
export const cursorY = writable(1);
export const cursor = derived([cursorX, cursorY], ([$cursorX, $cursorY]) => $cursorX && $cursorY && [$cursorX, $cursorY]);

export const direction = writable('→');
