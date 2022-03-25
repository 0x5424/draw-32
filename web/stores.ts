import { writable, derived } from 'svelte/store'

interface Coordinates {
  x: number;
  y: number;
}

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
  [cursor, directionText, rotationText, directionIncrements, patternOneLength, patternTwoLength, rawPattern],
  ([$cursor, $directionText, $rotationText, $directionIncrements, $patternOneLength, $patternTwoLength, $rawPattern]) => {
    if ($rawPattern === '') return [[], [], []]

    let lastCoords: Coordinates
    let [pseudoX, pseudoY] = $cursor
    const [incX, incY] = $directionIncrements
    // NOTE: Must decrement pseudocursor by 1 in order to start pattern draw on proper coordinates
    pseudoX -= incX
    pseudoY -= incY
    const out = {'0': [], '1': []}

    $rawPattern.split('').forEach(bit => {
      const currentLength = bit === '0' ? $patternOneLength : $patternTwoLength

      for (let i = 0; i < currentLength; ++i) {
        lastCoords = getNextCoordinatesFromDirection($directionText, pseudoX, pseudoY)
        out[bit].push([lastCoords.x, lastCoords.y])

        // For final iteration, skip cursor update (will be updated separately next)
        if (i !== currentLength - 1) {
          pseudoX = lastCoords.x
          pseudoY = lastCoords.y
        }
      }

      // After writing the full pattern, move cursor to new pattern location--depending on current rotation
      const nextPatternStart = getNextCoordinatesFromDirection($rotationText, pseudoX, pseudoY)
      pseudoX = nextPatternStart.x
      pseudoY = nextPatternStart.y
    })

    // Push most recent coords into last slot
    out['lastCoords'] = lastCoords

    return out
  })

export const insertCoordinates = derived(
  [cursor, directionText, insertLength],
  ([$cursor, $directionText, $insertLength]) => {
    const out = [[], []]
    let [nextX, nextY] = $cursor

    for (let i = 0; i < $insertLength; ++i) {
      const lastCoords = getNextCoordinatesFromDirection($directionText, nextX, nextY)

      out[0].push([nextX, nextY])

      nextX = lastCoords.x
      nextY = lastCoords.y
    }

    out[1] = [nextX, nextY]

    return out
  })
