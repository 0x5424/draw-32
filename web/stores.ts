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
export const prevCursor = writable([])

export const direction = writable('→')
export const directionText = derived(direction, $direction => {
  if ($direction === '←') return 'LEFT'
  if ($direction === '↓') return 'DOWN'
  if ($direction === '→') return 'RIGHT'
  if ($direction === '↑') return 'UP'
  throw new Error('invalid direction set')
})
export const prevDirection = writable('')

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

type CoordinatesTuple = [number, number] | []

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
    const out: [CoordinatesTuple[], CoordinatesTuple[], CoordinatesTuple] = [[], [], []]

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

    // Save next cursor coordinates; NOTE: Must re-decrement due to initial shift
    pseudoX += incX
    pseudoY += incY
    out[2] = [pseudoX, pseudoY]

    return out
  })

export const insertCoordinates = derived(
  [cursor, directionText, insertLength, rotationText],
  ([$cursor, $directionText, $insertLength, $rotationText]) => {
    /**
     * idx0 = pixels visited
     * idx1 = new cursor position
     */
    const out: [
      [number, number][],
      [number, number] | []
    ] = [[], []]
    let [nextX, nextY] = $cursor

    for (let i = 0; i < $insertLength; ++i) {
      const lastCoords = getNextCoordinatesFromDirection($directionText, nextX, nextY)

      out[0].push([nextX, nextY])

      nextX = lastCoords.x
      nextY = lastCoords.y
    }

    // NOTE: Final cursor needs final shift +-1 based on _last_ element
    const nextCursor = getNextCoordinatesFromDirection($rotationText, ...out[0][out[0].length - 1])

    out[1] = [nextCursor.x, nextCursor.y]

    return out
  })

export const currentSequence = (() => {
  let value = []
  let subs = []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscribe = (handler: any) => {
    subs = [...subs, handler]
    handler(value)
    return () => subs = subs.filter(sub => sub !== handler)
  }

  const set = (newInstruction: string[]) => {
    /**
     * Custom `set` validation to throw on overflow
     */
    if (newInstruction.join('').length > 255) throw new Error('Instruction will overflow; Refusing write')

    value = newInstruction
    subs.forEach(sub => sub(value))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update = (update: any) => set(update(value))

  return { subscribe, set, update }
})()

export const pastSequences = writable([])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const allSequences = derived([currentSequence, pastSequences], ([$currentSequence, $pastSequences]: [any, any]) => {
  const format = (val: string[]) => val.join('')

  const past = $pastSequences.map(format)
  const current = $currentSequence.join('')

  return [...past, current]
})
