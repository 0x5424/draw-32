import { writable, derived, Writable, Readable } from 'svelte/store'

import type { PatternOffset } from './util/instruction'

import {
  INCREMENTS,
  getNextCoordinatesFromDirection
} from './util/coordinates'

interface Coordinates {
  x: number;
  y: number;
}

type CoordinatesTuple = [x: number, y: number] | []

type DirectionArrow = '←' | '↓' | '→' | '↑'
export type DirectionText = 'LEFT' | 'DOWN' | 'RIGHT' | 'UP'
type RotationArrow ='↙' | '↘' | '↗' | '↖'
export type RotationText ='UP_LEFT' | 'UP_RIGHT' | 'DOWN_LEFT' | 'DOWN_RIGHT'

export const cursorX: Writable<number> = writable(1)
export const cursorY: Writable<number> = writable(1)

type CursorStore = [Readable<number>, Readable<number>]
export const cursor = derived<CursorStore, CoordinatesTuple>([cursorX, cursorY], ([$cursorX, $cursorY]) => [$cursorX, $cursorY] as CoordinatesTuple)
export const prevCursor: Writable<CoordinatesTuple> = writable([])

export const direction: Writable<DirectionArrow> = writable('→')
export const directionText = derived<Readable<DirectionArrow>, DirectionText>(direction, $direction => {
  if ($direction === '←') return 'LEFT'
  if ($direction === '↓') return 'DOWN'
  if ($direction === '→') return 'RIGHT'
  if ($direction === '↑') return 'UP'
  throw new Error('invalid direction set')
})
export const prevDirection: Writable<DirectionArrow | ''> = writable('')

export const cw: Writable<boolean> = writable(false)

type RotationStore = [Readable<DirectionText>, Readable<boolean>]
export const rotation = derived<RotationStore, RotationArrow>([directionText, cw], ([$directionText, $cw]) => {
  return {
    LEFT: {true: '↖', false: '↙'},
    DOWN: {true: '↙', false: '↘'},
    RIGHT: {true: '↘', false: '↗'},
    UP: {true: '↗', false: '↖'},
  }[$directionText][`${$cw}`] as RotationArrow
})
export const rotationText = derived<Readable<RotationArrow>, RotationText>(rotation, $rotation => {
  if ($rotation === '↖') return 'UP_LEFT'
  if ($rotation === '↗') return 'UP_RIGHT'
  if ($rotation === '↙') return 'DOWN_LEFT'
  if ($rotation === '↘') return 'DOWN_RIGHT'
  throw new Error('invalid rotation set')
})

export const directionIncrements = derived<Readable<DirectionText>, [number, number]>(directionText, $directionText => {
  return INCREMENTS[$directionText]
})

export const rotationIncrements = derived<Readable<RotationText>, [number, number]>(rotationText, $rotationText => {
  return INCREMENTS[$rotationText]
})

type DrawModes = 'pattern' | 'insert'
export const drawMode: Writable<DrawModes> = writable('pattern')

/* Pattern controls */
export const patternOneLength: Writable<PatternOffset> = writable(1)
export const patternTwoOffset: Writable<PatternOffset> = writable(1)

type PatternTwoLength = 2 | 3 | 4 | 5 | 6 | 7 | 8
type PatternTwoLengthStore = [Readable<PatternOffset>, Readable<PatternOffset>]
export const patternTwoLength = derived<PatternTwoLengthStore, PatternTwoLength>([patternOneLength, patternTwoOffset], ([$patternOneLength, $patternTwoOffset]) => $patternOneLength + $patternTwoOffset as PatternTwoLength)

export const rawPattern: Writable<string> = writable('')

/* Insert controls */
export const insertLength: Writable<number> = writable(1)

/* Stroke controls */
export const strokeSize: Writable<1 | 3> = writable(1)

/* Color controls */
export const color: Writable<string> = writable('000000')

/* Canvas info */
export const visited: Writable<Record<string, boolean>> = writable({})

type PatternCoordinatesStore = [
  Readable<CoordinatesTuple>, // Cursor
  Readable<DirectionText>,
  Readable<RotationText>,
  Readable<[number, number]>, // Increments
  Readable<PatternOffset>, // P1
  Readable<PatternTwoLength>, // P2
  Readable<string> // Raw pattern
]
type PatternCoordinatesResult = [CoordinatesTuple[], CoordinatesTuple[], CoordinatesTuple]
export const patternCoordinates = derived<PatternCoordinatesStore, PatternCoordinatesResult>(
  [cursor, directionText, rotationText, directionIncrements, patternOneLength, patternTwoLength, rawPattern],
  ([$cursor, $directionText, $rotationText, $directionIncrements, $patternOneLength, $patternTwoLength, $rawPattern]) => {
    if ($rawPattern === '') return [[], [], []] as PatternCoordinatesResult

    let lastCoords: Coordinates
    let [pseudoX, pseudoY] = $cursor
    const [incX, incY] = $directionIncrements
    // NOTE: Must decrement pseudocursor by 1 in order to start pattern draw on proper coordinates
    pseudoX -= incX
    pseudoY -= incY
    const out: PatternCoordinatesResult = [[], [], []]

    $rawPattern.split('').forEach(bit => {
      const currentLength = bit === '0' ? $patternOneLength : $patternTwoLength

      for (let i = 0; i < currentLength; ++i) {
        lastCoords = getNextCoordinatesFromDirection($directionText, pseudoX, pseudoY)
        out[bit].push([lastCoords.x, lastCoords.y] as [number, number])

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
    out[2] = [pseudoX, pseudoY] as [number, number]

    return out
  })

type InsertCoordinatesStore = [
  Readable<CoordinatesTuple>, // Cursor
  Readable<DirectionText>,
  Readable<RotationText>,
  Readable<number> // Insertion length
]
type InsertCoordinatesResult = [CoordinatesTuple[], CoordinatesTuple]
export const insertCoordinates = derived<InsertCoordinatesStore, InsertCoordinatesResult>(
  [cursor, directionText, rotationText, insertLength],
  ([$cursor, $directionText, $rotationText, $insertLength]) => {
    /**
     * idx0 = pixels visited
     * idx1 = new cursor position
     */
    const out: InsertCoordinatesResult = [[], []]
    let [nextX, nextY] = $cursor

    for (let i = 0; i < $insertLength; ++i) {
      const lastCoords = getNextCoordinatesFromDirection($directionText, nextX, nextY)

      out[0].push([nextX, nextY] as [number, number])

      nextX = lastCoords.x
      nextY = lastCoords.y
    }

    // NOTE: Final cursor needs final shift +-1 based on _last_ element
    const nextCursor = getNextCoordinatesFromDirection($rotationText, ...out[0][out[0].length - 1] as [number, number])

    out[1] = [nextCursor.x, nextCursor.y] as [number, number]

    return out
  })

/* Instructions */
export const currentSequence: Writable<string[]> = (() => {
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

export const currentSequenceInitialized = derived<Readable<string[]>, boolean>(currentSequence, $currentSequence => !!$currentSequence[0])

export const pastSequences: Writable<string[][]> = writable([])

type AllSequencesStore = [Readable<string[]>, Readable<string[][]>]
export const allSequences = derived<AllSequencesStore, string[]>([currentSequence, pastSequences], ([$currentSequence, $pastSequences]) => {
  const past = $pastSequences.map((ary) => ary.join(''))
  const current = $currentSequence.join('')

  return [...past, current]
})
