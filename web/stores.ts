import { writable, derived } from "svelte/store";

// export const currentCursor = writable([-1, -1]);
export const cursorX = writable(1);
export const cursorY = writable(1);
export const cursor = derived([cursorX, cursorY], ([$cursorX, $cursorY]) => $cursorX && $cursorY && [$cursorX, $cursorY]);

export const direction = writable('→');
export const directionText = derived(direction, $direction => {
  if ($direction === '←') return 'LEFT';
  if ($direction === '↓') return 'DOWN';
  if ($direction === '→') return 'RIGHT';
  if ($direction === '↑') return 'UP';
  throw new Error('invalid direction set')
});

export const cw = writable(false)
export const rotation = derived([directionText, cw], ([$directionText, $cw]) => {
  return {
    LEFT: {true: '↖', false: '↙'},
    DOWN: {true: '↙', false: '↘'},
    RIGHT: {true: '↘', false: '↗'},
    UP: {true: '↗', false: '↖'},
  }[$directionText][`${$cw}`]
});
