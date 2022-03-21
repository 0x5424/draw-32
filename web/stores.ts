import { writable, derived } from 'svelte/store'

import {
  INCREMENTS,
  getNextCoordinatesFromDirection
} from './util/coordinates'

export const cursorX = writable(1)
export const cursorY = writable(1)
export const cursor = derived([cursorX, cursorY], ([$cursorX, $cursorY]) => $cursorX && $cursorY && [$cursorX, $cursorY])

export const direction = writable('→')
export const directionText = derived(direction, $direction => {
  if ($direction === '←') return 'LEFT'
  if ($direction === '↓') return 'DOWN'
  if ($direction === '→') return 'RIGHT'
  if ($direction === '↑') return 'UP'
  throw new Error('invalid direction set')
})

export const cw = writable(false)
export const rotation = derived([directionText, cw], ([$directionText, $cw]) => {
  return {
    LEFT: {true: '↖', false: '↙'},
    DOWN: {true: '↙', false: '↘'},
    RIGHT: {true: '↘', false: '↗'},
    UP: {true: '↗', false: '↖'},
  }[$directionText][`${$cw}`]
})
export const rotationText = derived(rotation, $rotation => {
  if ($rotation === '↖') return 'UP_LEFT'
  if ($rotation === '↗') return 'UP_RIGHT'
  if ($rotation === '↙') return 'DOWN_LEFT'
  if ($rotation === '↘') return 'DOWN_RIGHT'
  throw new Error('invalid rotation set')
})

export const directionIncrements = derived(directionText, $directionText => {
  return INCREMENTS[$directionText]
})

export const rotationIncrements = derived(rotationText, $rotationText => {
  return INCREMENTS[$rotationText]
})

export const drawMode = writable('pattern')

/* Pattern controls */
export const patternOneLength = writable(1)
export const patternTwoLength = writable(2)
export const rawPattern = writable('')

/* Insert controls */
export const insertLength = writable(1)

/* Canvas info */
export const visited = writable({})
export const patternCoordinates = derived(
  [cursor, directionText, rotationText, directionIncrements, rotationIncrements, patternOneLength, patternTwoLength, rawPattern],
  ([$cursor, $directionText, $rotationText, $directionIncrements, $rotationIncrements, $patternOneLength, $patternTwoLength, $rawPattern]) => {
    if ($rawPattern === '') return [[], [], []];

    let lastCoords;
    let [pseudoX, pseudoY] = $cursor
    const out = [[], [], []]

    $rawPattern.split('').forEach(bitStr => {
      const bit = parseInt(bitStr)
      const currentLength = bit === 0 ? $patternOneLength : $patternTwoLength;

      for (let i = 0; i < currentLength; ++i) {
        lastCoords = getNextCoordinatesFromDirection($directionText, pseudoX, pseudoY);
        out[bit].push([lastCoords.x, lastCoords.y])

        pseudoX = lastCoords.x
        pseudoY = lastCoords.y
      }

      // After writing the full pattern, move cursor to new pattern location--depending on current rotation
      const nextPatternStart = getNextCoordinatesFromDirection($rotationText, pseudoX, pseudoY)
      pseudoX = nextPatternStart.x
      pseudoY = nextPatternStart.y
    })

    // Push most recent coords into last slot
    out[2] = lastCoords;

    return out
})
