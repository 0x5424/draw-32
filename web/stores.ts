/** @todo Clean-up, split stores into stores/*.ts and stores/index.ts */
import { writable, derived, Writable, Readable } from 'svelte/store'

import type { PatternOffset, StrokeMode, CoordinatesTuple } from './util/instruction'
import type { MatrixCell } from './util/matrix'

import {
  INCREMENTS,
  getNextCoordinatesFromDirection,
  getSurroundingCoordinates
} from './util/coordinates'

import { InstructionObject, parseInstructionStream } from './util/parse'

/** Helper fn to retrieve current store value, then immediately unsubscribe (lambda) */
export const getCurrentStoreValue = <T>(store: Readable<T>): T => {
  let value: T
  store.subscribe((currentValue) => {
    value = currentValue
  })()

  return value
}

interface GetStrokeCellsParameters {
  mode: StrokeMode;
  x: number;
  y: number;
  dir: DirectionText;
  visited: CanvasLike;
  color: string;
}

/**
 * Local utility function to evaluate which cells should be filled surrounding a pair of coords
 */
const getStrokeCells = (args: GetStrokeCellsParameters): CoordinatesTuple[] => {
  const {
    mode,
    x: inputX,
    y: inputY,
    dir,
    visited,
    color,
  } = args
  const baseCell = [inputX, inputY] as CoordinatesTuple

  if (mode === 0) return [baseCell]

  // Depending on rotation & already filled in squares, we will use only 2 surrounding coordinates
  let inserted = 0
  const orderedCoordinates = Object.entries(getSurroundingCoordinates(inputX, inputY)).sort((a, b) => {
    const table = {
      LEFT: ['UP', 'DOWN', 'RIGHT', 'LEFT'],
      RIGHT: ['UP', 'DOWN', 'LEFT','RIGHT'],
      UP: ['LEFT', 'RIGHT', 'DOWN', 'UP'],
      DOWN: ['LEFT', 'RIGHT', 'UP', 'DOWN'],
    }[dir]

    return table.indexOf(a[0]) - table.indexOf(b[0])
  })

  const extraCells = orderedCoordinates.map(([, coords]) => {
    if (inserted >= 2) return

    const [x, y] = coords
    if (visited[`${x}:${y}`] === color) return // Skip if we've already filled it with same color

    inserted++
    return [x, y]
  }).filter(Boolean) as CoordinatesTuple[]

  return [baseCell, ...extraCells]
}

interface Coordinates {
  x: number;
  y: number;
}

export type DirectionArrow = '←' | '↓' | '→' | '↑'
export type DirectionText = 'LEFT' | 'DOWN' | 'RIGHT' | 'UP'
type RotationArrow ='↙' | '↘' | '↗' | '↖'
export type RotationText ='UP_LEFT' | 'UP_RIGHT' | 'DOWN_LEFT' | 'DOWN_RIGHT'

export const matrix: Writable<MatrixCell[][]> = writable([[]])

export const cursorX: Writable<number> = writable(1)
export const cursorY: Writable<number> = writable(1)

type CursorStore = [Readable<number>, Readable<number>]
export const cursor = derived<CursorStore, CoordinatesTuple>([cursorX, cursorY], ([$cursorX, $cursorY]) => [$cursorX, $cursorY] as CoordinatesTuple)
export const prevCursor: Writable<CoordinatesTuple | []> = writable([])

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

export type DrawMode = 'pattern' | 'insert' | 'fill'
export const drawMode: Writable<DrawMode> = writable('pattern')

/* Pattern controls */
export const patternOneLength: Writable<PatternOffset> = writable(1)
export const patternTwoOffset: Writable<PatternOffset> = writable(1)

type PatternTwoLength = 2 | 3 | 4 | 5 | 6 | 7 | 8
type PatternTwoLengthStore = [Readable<PatternOffset>, Readable<PatternOffset>]
export const patternTwoLength = derived<PatternTwoLengthStore, PatternTwoLength>([patternOneLength, patternTwoOffset], ([$patternOneLength, $patternTwoOffset]) => $patternOneLength + $patternTwoOffset as PatternTwoLength)

export const rawPattern: Writable<string> = (() => {
  let value = ''
  let subs = []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscribe = (handler: any) => {
    subs = [...subs, handler]
    handler(value)
    return () => subs = subs.filter(sub => sub !== handler)
  }

  // Custom `set` validation to only append 0 or 1 strings
  const set = (newSequence: string) => {
    if (!/^[01]+|$/.test(newSequence)) return

    value = newSequence
    subs.forEach(sub => sub(value))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update = (update: any) => set(update(value))

  return { subscribe, set, update }
})()

/* Canvas info */
type MatrixLike = MatrixCell[][]
export type CanvasLike = Record<string, string>
export const visited: Writable<CanvasLike> = writable({})
export const canvas = derived<[Readable<MatrixLike>, Readable<CanvasLike>], CanvasLike>([matrix, visited], ([$matrix, $visited]) => {
  // Output a new canvas with all visited cells set
  const out = {}
  const BG_COLOR = 'alpha' /** @todo Move to constant (hard-coded BACKGROUND_COLOR) */

  $matrix.forEach(row => {
    row.forEach(({ x, y }) => out[[x, y].join(':')] = $visited[[x, y].join(':')] || BG_COLOR)
  })

  return out
})

/* Color controls */
export const color: Writable<string> = writable('000000')

/* Insert controls */
export const insertLength: Writable<number> = writable(1)

/* Stroke controls */
export const strokeMode: Writable<StrokeMode> = writable(0)
type StrokeCellsStore = [
  Readable<StrokeMode>,
  Readable<CoordinatesTuple>,
  Readable<DirectionText>,
  Readable<CanvasLike>,
  Readable<string>,
]
export const strokeCells = derived<StrokeCellsStore, CoordinatesTuple[]>([strokeMode, cursor, directionText, visited, color], ([$strokeMode, $cursor, $directionText, $visited, $color]) => {
  const [x, y] = $cursor
  const args = {
    x, y,
    mode: $strokeMode,
    dir: $directionText,
    visited: $visited,
    color: $color,
  }

  return Object.values(getStrokeCells(args))
})

/* Fill info */
/** @todo Performance */
type FillCellsStore = [Readable<CoordinatesTuple>, Readable<MatrixLike>, Readable<string>, Readable<CanvasLike>]
const fillCells = derived<FillCellsStore, CanvasLike>([cursor, matrix, color, canvas], ([$cursor, $matrix, $color, $canvas]) => {
  const maxHeight = $matrix.length
  const maxWidth = $matrix[0].length
  // Guard clause for uninitialized matrix
  if (maxWidth === 0) return

  // Init output
  const out = {}
  const startColor: string = $canvas[$cursor.join(':')]

  // Normalize cursor, as the matrix will use 0-indexed values
  const currentX = $cursor[0] - 1
  const currentY = $cursor[1] - 1

  // Initialize the cells to check
  const initialCoordinates = [[currentX, currentY]] as [number, number][]
  const recurse = (stack: [number, number][]) => {
    if (stack.length === 0) return
    const [x, y] = stack.pop()

    Object.values(getSurroundingCoordinates(x, y)).forEach(([possibleX, possibleY]) => {
      if (possibleX < 0 || possibleY < 0) return // Underflow
      if (possibleX >= maxWidth || possibleY >= maxHeight) return // Overflow

      const possibleCoord = [possibleX + 1, possibleY + 1].join(':')
      if ($canvas[possibleCoord] !== startColor) return // New color
      if (out[possibleCoord]) return // Already included (identity)

      // Else, add to output hash & stack
      out[possibleCoord] = $color
      stack.push([possibleX, possibleY])
    })

    recurse(stack)
  }
  recurse(initialCoordinates)

  return out
})

type PatternCoordinatesStore = [
  Readable<CoordinatesTuple>, // Cursor
  Readable<DirectionText>,
  Readable<RotationText>,
  Readable<[number, number]>, // Increments
  Readable<PatternOffset>, // P1
  Readable<PatternTwoLength>, // P2
  Readable<string> // Raw pattern
]
export type PatternCoordinatesResult = [CoordinatesTuple[], CoordinatesTuple[], CoordinatesTuple | []]
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
export type InsertCoordinatesResult = [CoordinatesTuple[], CoordinatesTuple | []]
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
type Subscriber<T, R = void> = (v: T) => R
export const currentInstructionBuffer: Writable<string[]> = (() => {
  let value: string[] = []
  let subs: Subscriber<string[]>[] = []

  const subscribe = (handler: Subscriber<string[]>) => {
    subs = [...subs, handler]
    handler(value)
    return () => subs = subs.filter(sub => sub !== handler)
  }

  const set = (newInstruction: string[]) => {
    /* Custom `set` validation to throw on overflow */
    if (newInstruction.join('').length > 255) throw new Error('Instruction will overflow; Refusing write')

    value = newInstruction
    subs.forEach(sub => sub(value))
  }

  /**
   * Store will provide the current `value` to the caller,
   * Caller is expected to return new state for `value`
   */
  const update = (handler: Subscriber<string[], string[]>) => set(handler(value))

  return { subscribe, set, update }
})()

type ToVisitStore = [
  Readable<StrokeMode>,
  Readable<string>,
  Readable<DirectionText>,
  Readable<DrawMode>,
  Readable<PatternCoordinatesResult>,
  Readable<InsertCoordinatesResult>,
  Readable<CanvasLike>,
  Readable<CanvasLike>
]
export const toVisit = derived<ToVisitStore, CanvasLike>(
  [strokeMode, color, directionText, drawMode, patternCoordinates, insertCoordinates, visited, fillCells],
  ([$strokeMode, $color, $directionText, $drawMode, $patternCoordinates, $insertCoordinates, $visited, $fillCells]) => {
    const out = {}
    const baseArgs = {
      mode: $strokeMode,
      dir: $directionText,
      visited: $visited,
      color: $color
    }

    switch ($drawMode) {
    case 'insert':
      $insertCoordinates[0].map(([insertX, insertY]) => {
        getStrokeCells({ ...baseArgs, x: insertX, y: insertY }).forEach(([x, y]) => out[`${x}:${y}`] = $color)
      })
      break
    case 'pattern':
      [...$patternCoordinates[0], ...$patternCoordinates[1]].forEach(([patternX, patternY]) => {
        getStrokeCells({ ...baseArgs, x: patternX, y: patternY }).forEach(([x, y]) => out[`${x}:${y}`] = $color)
      })
      break
    case 'fill':
      return $fillCells
    default:
      break
    }

    return out
  })


export const pastSequences: Writable<InstructionObject[][]> = writable([])
export const currentSequence = derived<Readable<string[]>, InstructionObject[]>(currentInstructionBuffer, $currentInstructionBuffer => {
  const stream = $currentInstructionBuffer.join('')
  return stream === '' ? [] : parseInstructionStream(stream)
})
export const currentSequenceInitialized = derived<Readable<InstructionObject[]>, boolean>(currentSequence, $currentSequence => !!$currentSequence[0])

type AllSequencesStore = [Readable<InstructionObject[]>, Readable<InstructionObject[][]>]
export const allSequences = derived<AllSequencesStore, InstructionObject[][]>(
  [currentSequence, pastSequences],
  ([$currentSequence, $pastSequences]) => [...$pastSequences, $currentSequence]
)

// Requires all stores that are referenced as args, and a few webapp-specific stores for paint
export type ExecutableStores = {
  /* Stores used to initialize canvas */
  currentInstructionBufferStore: Writable<string[]>
  pastSequencesStore: Writable<InstructionObject[][]>
  /* Main stores to modify canvas, used by all */
  cwStore: Writable<boolean>
  visitedStore: Writable<CanvasLike>
  drawModeStore: Writable<DrawMode>
  toVisitStore: Readable<CanvasLike>
  /* STROKE */
  strokeModeStore: Writable<StrokeMode>
  /* PATTERN */
  patternOneLengthStore: Writable<PatternOffset>
  patternTwoOffsetStore: Writable<PatternOffset>
  rawPatternStore: Writable<string>
  patternCoordinatesStore: Readable<PatternCoordinatesResult>
  /* INSERT */
  insertLengthStore: Writable<number>
  insertCoordinatesStore: Readable<InsertCoordinatesResult>
  /* DIRECTION */
  directionStore: Writable<DirectionArrow>
  prevDirectionStore: Writable<DirectionArrow | ''>
  /* COLOR */
  colorStore: Writable<string>
  /* FILL */
  /* JUMP */
  cursorXStore: Writable<number>
  cursorYStore: Writable<number>
  prevCursorStore: Writable<CoordinatesTuple | []>
}

/**
 * Helper object for grabbing all stores needed to replay instructions
 *
 * @see {@link instruction.ts#execInstruction}
 */
export const executableStores: ExecutableStores = {
  cwStore: cw,
  visitedStore: visited,
  drawModeStore: drawMode,
  toVisitStore: toVisit,
  strokeModeStore: strokeMode,
  patternOneLengthStore: patternOneLength,
  patternTwoOffsetStore: patternTwoOffset,
  patternCoordinatesStore: patternCoordinates,
  rawPatternStore: rawPattern,
  insertLengthStore: insertLength,
  insertCoordinatesStore: insertCoordinates,
  directionStore: direction,
  prevDirectionStore: prevDirection,
  colorStore: color,
  cursorXStore: cursorX,
  cursorYStore: cursorY,
  prevCursorStore: prevCursor,
  currentInstructionBufferStore: currentInstructionBuffer,
  pastSequencesStore: pastSequences,
} as const
